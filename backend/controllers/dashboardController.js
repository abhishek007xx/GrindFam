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

    const forceSync = req.query.forceSync === 'true' || req.body?.forceSync === true;

    // 6. Query LeetCode data & calculate Platform Solved for all users in parallel
    const leaderboardData = await Promise.all(
      allProfiles.map(async (profile) => {
        const lcData = await fetchUserTodayData(profile.leetcode_username);
        const todayCount = lcData.todayCount || 0;
        const targetHit = todayCount >= dailyTarget;

        // Sync historical LeetCode submission calendar into daily_activity
        if (!lcData.error) {
          try {
            if (forceSync) {
              await syncUserLeetCodeHistory(profile.id, profile.leetcode_username, forceSync);
            } else {
              syncUserLeetCodeHistory(profile.id, profile.leetcode_username, false).catch(err => {
                console.warn(`Background sync error for ${profile.leetcode_username}:`, err.message);
              });
            }

            // Upsert today's count — use max(existing, incoming) to never lose data
            let finalTodayCount = todayCount;
            try {
              const { data: existingToday } = await supabase
                .from('daily_activity')
                .select('solved_count')
                .eq('user_id', profile.id)
                .eq('activity_date', todayDate)
                .maybeSingle();

              if (existingToday && existingToday.solved_count > todayCount) {
                finalTodayCount = existingToday.solved_count;
              }
            } catch (_) { /* proceed with API count */ }

            await supabase
              .from('daily_activity')
              .upsert(
                {
                  user_id: profile.id,
                  activity_date: todayDate,
                  solved_count: finalTodayCount,
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id, activity_date' }
              );
          } catch (activityErr) {
            console.error(`Error logging activity for ${profile.leetcode_username}:`, activityErr);
          }
        }


        // Fetch activity history for user to calculate streak & platformTotal
        let activityTotal = 0;
        let streak = 0;
        try {
          const { data: activityRows } = await supabase
            .from('daily_activity')
            .select('activity_date, solved_count')
            .eq('user_id', profile.id)
            .gt('solved_count', 0);

          if (activityRows && activityRows.length > 0) {
            activityTotal = activityRows.reduce((sum, row) => sum + (row.solved_count || 0), 0);
            
            // Calculate streak
            const dates = activityRows.map(r => r.activity_date);
            const sortedDates = Array.from(new Set(dates)).sort().reverse();
            const todayStr = todayDate;
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

            if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
              let checkDate = new Date(sortedDates[0]);
              for (const dStr of sortedDates) {
                const expected = checkDate.toISOString().split('T')[0];
                if (dStr === expected) {
                  streak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }
            }
          } else {
            activityTotal = todayCount;
            if (todayCount > 0) streak = 1;
          }
        } catch (sumErr) {
          console.error(`Error fetching platform total for ${profile.id}:`, sumErr);
          activityTotal = todayCount;
        }

        const platformTotal = Math.max(lcData.totalSolved || 0, activityTotal);

        return {
          id: profile.id,
          name: profile.name || profile.leetcode_username || 'Grinder',
          leetcodeUsername: profile.leetcode_username,
          isSelf: profile.isSelf,
          relationshipId: profile.relationshipId,
          platformTotal, // Total solved on LeetCode / GrindFam
          todayCount,    // Full today count
          easyCount: lcData.easyCount || 0,
          mediumCount: lcData.mediumCount || 0,
          hardCount: lcData.hardCount || 0,
          targetHit,
          streak,
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

    // Calculate rank and assign MVP badges
    const leaderboard = leaderboardData.map((item, index) => {
      let badge = null;
      if (index === 0 && item.todayCount > 0) badge = '👑 Leaderboard MVP';
      else if (item.streak >= 3) badge = `🔥 ${item.streak} Day Streak`;
      else if (item.targetHit) badge = '🎯 Target Smashed';

      return {
        ...item,
        rank: index + 1,
        badge
      };
    });

    // Summary stats & Squad aggregates
    const selfData = leaderboard.find((u) => u.isSelf) || { todayCount: 0, targetHit: false, platformTotal: 0, streak: 0 };
    const totalFriends = Math.max(0, allProfiles.length - 1);
    const hitTargetTodayCount = leaderboard.filter((u) => u.targetHit).length;
    const squadTodaySolved = leaderboard.reduce((sum, u) => sum + u.todayCount, 0);
    const squadCompletionRate = leaderboard.length > 0
      ? Math.round((hitTargetTodayCount / leaderboard.length) * 100)
      : 0;

    return res.json({
      dailyTarget,
      userProfile,
      squadInfo: activeSquad ? {
        id: activeSquad.id,
        name: activeSquad.name,
        code: activeSquad.code,
        createdBy: activeSquad.created_by,
        memberCount: leaderboard.length,
        squadTodaySolved,
        squadCompletionRate
      } : null,
      stats: {
        dailyTarget,
        totalFriends,
        hitTargetTodayCount,
        yourTodayCount: selfData.todayCount,
        yourTargetHit: selfData.targetHit,
        yourPlatformTotal: selfData.platformTotal,
        yourStreak: selfData.streak,
        easyCount: selfData.easyCount || 0,
        mediumCount: selfData.mediumCount || 0,
        hardCount: selfData.hardCount || 0,
        squadTodaySolved,
        squadCompletionRate
      },
      leaderboard
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const syncLeetCodeData = async (req, res) => {
  req.query.forceSync = 'true';
  return getDashboardData(req, res);
};

module.exports = {
  getDashboardData,
  syncLeetCodeData
};
