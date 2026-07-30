const supabase = require('../config/supabaseClient');
const { fetchUserTodayData } = require('../services/leetcodeService');

/**
 * GET /api/dashboard
 * Protected route to get self + friends leaderboard and dashboard metrics
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch group daily target from `group_settings` table
    const { data: targetRow } = await supabase
      .from('group_settings')
      .select('daily_target')
      .eq('id', 1)
      .maybeSingle();

    const dailyTarget = targetRow ? targetRow.daily_target : 5;

    // 2. Get logged-in user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({ error: 'User profile not found. Please complete signup.' });
    }

    // 3. Get list of friend IDs for the logged-in user
    const { data: friendRows, error: friendsError } = await supabase
      .from('friends')
      .select('id, friend_id')
      .eq('user_id', userId);

    if (friendsError) {
      console.error('Error fetching friends list:', friendsError);
      return res.status(500).json({ error: 'Error fetching friends data' });
    }

    const friendIdMap = {};
    (friendRows || []).forEach((f) => {
      friendIdMap[f.friend_id] = f.id;
    });

    const friendIds = Object.keys(friendIdMap);

    // 4. Fetch profiles of friends if any exist
    let friendProfiles = [];
    if (friendIds.length > 0) {
      const { data: friendsData, error: friendProfilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (!friendProfilesError && friendsData) {
        friendProfiles = friendsData;
      }
    }

    // 5. Combine self + friends profiles
    const allProfiles = [
      { ...userProfile, isSelf: true, relationshipId: null },
      ...friendProfiles.map((p) => ({
        ...p,
        isSelf: false,
        relationshipId: friendIdMap[p.id] || null
      }))
    ];

    const todayDate = new Date().toISOString().split('T')[0];

    // 6. Query LeetCode data & calculate Platform Solved for all users in parallel
    const leaderboardData = await Promise.all(
      allProfiles.map(async (profile) => {
        const lcData = await fetchUserTodayData(profile.leetcode_username);
        const todayCount = lcData.todayCount || 0;
        const targetHit = todayCount >= dailyTarget;

        // Upsert today's solved count into `daily_activity` table
        if (!lcData.error) {
          try {
            await supabase
              .from('daily_activity')
              .upsert(
                {
                  user_id: profile.id,
                  activity_date: todayDate,
                  solved_count: todayCount,
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id, activity_date' }
              );
          } catch (activityErr) {
            console.error(`Error logging activity for ${profile.leetcode_username}:`, activityErr);
          }
        }

        // Fetch sum of all solved counts on GrindFam for this user
        let platformTotal = 0;
        try {
          const { data: activityRows } = await supabase
            .from('daily_activity')
            .select('solved_count')
            .eq('user_id', profile.id);

          if (activityRows && activityRows.length > 0) {
            platformTotal = activityRows.reduce((sum, row) => sum + (row.solved_count || 0), 0);
          } else {
            platformTotal = todayCount;
          }
        } catch (sumErr) {
          console.error(`Error fetching platform total for ${profile.id}:`, sumErr);
          platformTotal = todayCount;
        }

        return {
          id: profile.id,
          name: profile.name,
          leetcodeUsername: profile.leetcode_username,
          isSelf: profile.isSelf,
          relationshipId: profile.relationshipId,
          platformTotal, // Total solved on GrindFam
          todayCount,    // Full today count (even if > 5)
          targetHit,
          error: lcData.error
        };
      })
    );

    // 7. Sort by todayCount descending, then platformTotal descending
    leaderboardData.sort((a, b) => {
      if (b.todayCount !== a.todayCount) {
        return b.todayCount - a.todayCount;
      }
      return b.platformTotal - a.platformTotal;
    });

    // Calculate rank
    const leaderboard = leaderboardData.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    // Summary stats
    const selfData = leaderboard.find((u) => u.isSelf) || { todayCount: 0, targetHit: false, platformTotal: 0 };
    const totalFriends = friendProfiles.length;
    const hitTargetTodayCount = leaderboard.filter((u) => u.targetHit).length;

    return res.json({
      dailyTarget,
      userProfile,
      stats: {
        dailyTarget,
        totalFriends,
        hitTargetTodayCount,
        yourTodayCount: selfData.todayCount,
        yourTargetHit: selfData.targetHit,
        yourPlatformTotal: selfData.platformTotal
      },
      leaderboard
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardData
};
