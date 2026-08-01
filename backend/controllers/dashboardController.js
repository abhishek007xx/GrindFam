const supabase = require('../config/supabaseClient');
const { fetchUserTodayData, syncUserLeetCodeHistory } = require('../services/leetcodeService');

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

    // 3. Resolve full connected squad network for the logged-in user
    const squadUserIds = new Set([userId]);
    const queue = [userId];
    let depth = 0;
    const maxDepth = 3; // Traverse up to 3 hops within the squad cluster

    while (queue.length > 0 && depth < maxDepth) {
      const currentLevelSize = queue.length;
      depth++;
      const currentBatch = queue.splice(0, currentLevelSize);

      const { data: connections, error: connError } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.in.(${currentBatch.join(',')}),friend_id.in.(${currentBatch.join(',')})`);

      if (!connError && connections) {
        for (const conn of connections) {
          const neighborId = conn.user_id && currentBatch.includes(conn.user_id) ? conn.friend_id : conn.user_id;
          if (neighborId && !squadUserIds.has(neighborId)) {
            squadUserIds.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
    }

    // 4. Fetch profiles of all members in the squad network
    const squadIdArray = Array.from(squadUserIds);
    const { data: squadProfiles, error: squadProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', squadIdArray);

    if (squadProfilesError) {
      console.error('Error fetching squad profiles:', squadProfilesError);
      return res.status(500).json({ error: 'Error fetching squad member profiles' });
    }

    // Ensure logged-in user profile is included if profiles search didn't return it
    const profileMap = new Map();
    (squadProfiles || []).forEach((p) => profileMap.set(p.id, p));
    if (!profileMap.has(userId)) {
      profileMap.set(userId, userProfile);
    }

    // 5. Combine profiles with isSelf indicator
    const allProfiles = Array.from(profileMap.values()).map((p) => ({
      ...p,
      isSelf: p.id === userId,
      relationshipId: null
    }));

    const todayDate = new Date().toISOString().split('T')[0];

    // 6. Query LeetCode data & calculate Platform Solved for all users in parallel
    const leaderboardData = await Promise.all(
      allProfiles.map(async (profile) => {
        const lcData = await fetchUserTodayData(profile.leetcode_username);
        const todayCount = lcData.todayCount || 0;
        const targetHit = todayCount >= dailyTarget;

        // Sync historical LeetCode submission calendar into daily_activity
        if (!lcData.error) {
          try {
            await syncUserLeetCodeHistory(profile.id, profile.leetcode_username);
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
    const totalFriends = Math.max(0, allProfiles.length - 1);
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
