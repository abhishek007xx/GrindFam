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

    // 3. Resolve user's active squad from `squad_members` table
    let activeSquad = null;
    let squadUserIds = new Set([userId]);

    try {
      const { data: memberRow, error: memberError } = await supabase
        .from('squad_members')
        .select('*, squad:squads(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (!memberError && memberRow && memberRow.squad) {
        activeSquad = memberRow.squad;
        // Fetch all member IDs in this squad
        const { data: squadMembers } = await supabase
          .from('squad_members')
          .select('user_id')
          .eq('squad_id', activeSquad.id);

        (squadMembers || []).forEach((m) => squadUserIds.add(m.user_id));
      } else if (!memberError) {
        // User not in any squad yet - try auto-creating one
        try {
          const { autoEnsureUserSquad } = require('../config/squadInit');
          const squadId = await autoEnsureUserSquad(userId, userProfile);
          if (squadId) {
            const { data: freshSquad } = await supabase.from('squads').select('*').eq('id', squadId).single();
            const { data: squadMembers } = await supabase.from('squad_members').select('user_id').eq('squad_id', squadId);
            activeSquad = freshSquad;
            (squadMembers || []).forEach((m) => squadUserIds.add(m.user_id));
          }
        } catch (autoErr) {
          console.warn('Auto-ensure squad skipped:', autoErr.message);
        }
      }
    } catch (squadErr) {
      // Squad tables may not exist yet - fall back to friends-based lookup
      console.warn('Squad tables not available, falling back to friends-based lookup:', squadErr.message);
      try {
        const { data: friendRows } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', userId);
        (friendRows || []).forEach((f) => squadUserIds.add(f.friend_id));
      } catch (friendErr) {
        console.warn('Friends lookup also failed:', friendErr.message);
      }
    }

    // 4. Fetch profiles of all members in the squad
    const squadIdArray = Array.from(squadUserIds);
    const { data: squadProfiles, error: squadProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', squadIdArray);

    if (squadProfilesError) {
      console.error('Error fetching squad profiles:', squadProfilesError);
      return res.status(500).json({ error: 'Error fetching squad member profiles' });
    }

    // Ensure logged-in user profile is included
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
      squadInfo: activeSquad ? {
        id: activeSquad.id,
        name: activeSquad.name,
        code: activeSquad.code,
        createdBy: activeSquad.created_by
      } : null,
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
