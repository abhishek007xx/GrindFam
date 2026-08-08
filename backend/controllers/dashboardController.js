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
    let userProfile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      userProfile = data;
    } catch (_) {}

    if (!userProfile) {
      userProfile = {
        id: userId,
        full_name: req.user?.user_metadata?.full_name || req.user?.email?.split('@')[0] || 'User',
        email: req.user?.email || '',
        leetcode_username: req.user?.user_metadata?.leetcode_username || 'Abhishek_jb007',
        avatar_url: req.user?.user_metadata?.avatar_url || ''
      };
      try {
        await supabase.from('profiles').upsert(userProfile);
      } catch (_) {}
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
            const { data: freshSquad } = await supabase.from('squads').select('*').eq('id', squadId).maybeSingle();
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
    let squadProfiles = [];
    try {
      const { data: spData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', squadIdArray);
      squadProfiles = spData || [];
    } catch (squadProfilesErr) {
      console.warn('Error fetching squad profiles:', squadProfilesErr.message);
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

    // 6. Query LeetCode data & calculate metrics for all users in parallel
    const leaderboardData = await Promise.all(
      allProfiles.map(async (profile) => {
        let todayCount = 0;
        let platformTotal = 0;
        let streak = 0;
        let easyCount = 0;
        let mediumCount = 0;
        let hardCount = 0;
        let error = null;

        // Fetch existing DB activity history first
        let activityRows = [];
        try {
          const { data: dbRows } = await supabase
            .from('daily_activity')
            .select('activity_date, solved_count')
            .eq('user_id', profile.id)
            .gt('solved_count', 0);
          activityRows = dbRows || [];
        } catch (dbErr) {
          console.warn(`Error reading daily_activity for ${profile.id}:`, dbErr.message);
        }

        // Fetch user_progress count solved today
        let userProgressTodayCount = 0;
        try {
          const { data: userProgRows } = await supabase
            .from('user_progress')
            .select('solved_at')
            .eq('user_id', profile.id)
            .eq('status', 'solved');

          if (userProgRows) {
            userProgRows.forEach(row => {
              if (row.solved_at && (row.solved_at.startsWith(todayDate) || row.solved_at.split('T')[0] === todayDate)) {
                userProgressTodayCount++;
              }
            });
          }
        } catch (progErr) {
          console.warn(`Error reading user_progress for ${profile.id}:`, progErr.message);
        }

        const existingTodayRow = activityRows.find(r => r.activity_date === todayDate);
        const dbTodayCount = existingTodayRow ? (existingTodayRow.solved_count || 0) : 0;

        // Run live LeetCode fetch if forceSync is true OR if both DB activity & user_progress today counts are 0
        const shouldRunLiveSync = forceSync || (dbTodayCount === 0 && userProgressTodayCount === 0 && profile.leetcode_username);

        if (shouldRunLiveSync && profile.leetcode_username) {
          const lcData = await fetchUserTodayData(profile.leetcode_username, profile.id);
          const lcTodayCount = lcData.todayCount || 0;
          easyCount = lcData.easyCount || 0;
          mediumCount = lcData.mediumCount || 0;
          hardCount = lcData.hardCount || 0;
          error = lcData.error;

          if (!lcData.error) {
            try {
              if (lcData.avatarUrl) {
                await supabase
                  .from('profiles')
                  .update({ avatar_url: lcData.avatarUrl })
                  .eq('id', profile.id);
                profile.avatar_url = lcData.avatarUrl;
              }

              await syncUserLeetCodeHistory(profile.id, profile.leetcode_username, forceSync);

              if (lcData.recentAcSubmissions && lcData.recentAcSubmissions.length > 0) {
                const solvedRows = lcData.recentAcSubmissions.map(slug => ({
                  user_id: profile.id,
                  problem_id: slug,
                  status: 'solved',
                  solve_count: 1,
                  solved_at: new Date().toISOString()
                }));
                try {
                  await supabase.from('user_progress').upsert(solvedRows, { onConflict: 'user_id,problem_id' });
                } catch (upsertErr) {
                  console.warn('user_progress upsert warning:', upsertErr.message);
                }
              }

              todayCount = Math.max(lcTodayCount, userProgressTodayCount, dbTodayCount);

              if (todayCount > dbTodayCount) {
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

                const { data: updatedRows } = await supabase
                  .from('daily_activity')
                  .select('activity_date, solved_count')
                  .eq('user_id', profile.id)
                  .gt('solved_count', 0);
                activityRows = updatedRows || [];
              }
            } catch (activityErr) {
              console.error(`Error logging activity for ${profile.leetcode_username}:`, activityErr);
            }
          } else {
            todayCount = Math.max(dbTodayCount, userProgressTodayCount);
          }
        } else {
          todayCount = Math.max(dbTodayCount, userProgressTodayCount);
        }

        // Compute streak & platformTotal from DB activity rows
        let activityTotal = 0;
        if (activityRows.length > 0) {
          activityTotal = activityRows.reduce((sum, row) => sum + (row.solved_count || 0), 0);
          platformTotal = activityTotal;

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
          platformTotal = todayCount;
          if (todayCount > 0) streak = 1;
        }

        // Real counts directly from LeetCode / Supabase without dummy multipliers
        easyCount = easyCount || 0;
        mediumCount = mediumCount || 0;
        hardCount = hardCount || 0;

        const targetHit = todayCount >= dailyTarget;

        const userAvatar = profile.avatar_url || profile.avatarUrl || null;

        return {
          id: profile.id,
          name: profile.name || profile.leetcode_username || 'Grinder',
          leetcodeUsername: profile.leetcode_username,
          avatarUrl: userAvatar,
          avatar_url: userAvatar,
          isSelf: profile.isSelf,
          relationshipId: profile.relationshipId,
          platformTotal,
          todayCount,
          easyCount,
          mediumCount,
          hardCount,
          targetHit,
          streak,
          error
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

/**
 * POST /api/dashboard/sync-leetcode-solved
 * Fetches all accepted submissions from LeetCode GraphQL for the logged-in user,
 * upserts them into user_progress table in Supabase, and returns solvedSlugs.
 */
const syncUserLeetCodeSolvedProblems = async (req, res) => {
  try {
    let userId = req.user?.id || null;
    let leetcodeUsername = req.query?.username || req.body?.username || null;

    if (userId && !leetcodeUsername) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('leetcode_username')
        .eq('id', userId)
        .maybeSingle();

      leetcodeUsername = profile?.leetcode_username || req.user?.user_metadata?.leetcode_username || null;
    }

    if (!leetcodeUsername) {
      return res.status(400).json({ error: 'No LeetCode username provided or linked to your profile.' });
    }

    const lcData = await fetchUserTodayData(leetcodeUsername, userId);
    const solvedSlugs = lcData.recentAcSubmissions || [];

    if (userId && solvedSlugs.length > 0) {
      const rowsToUpsert = solvedSlugs.map(slug => ({
        user_id: userId,
        problem_id: slug,
        status: 'solved',
        solve_count: 1,
        solved_at: new Date().toISOString()
      }));

      try {
        await supabase.from('user_progress').upsert(rowsToUpsert, { onConflict: 'user_id,problem_id' });
      } catch (upsertErr) {
        console.warn('user_progress upsert warning:', upsertErr.message);
      }
    }

    return res.json({
      success: true,
      leetcodeUsername,
      solvedSlugs,
      totalSolved: lcData.totalSolved || solvedSlugs.length
    });
  } catch (err) {
    console.error('Error in syncUserLeetCodeSolvedProblems:', err);
    return res.status(500).json({ error: err.message || 'Failed to sync LeetCode solved problems' });
  }
};

/**
 * GET /api/dashboard/global-leaderboard
 * Worldwide leaderboard for ALL registered platform users using 100% real data.
 */
const getGlobalLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user?.id;

    // 1. Fetch all registered user profiles from database
    let dbProfiles = [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbProfiles = data;
      }
    } catch (dbErr) {
      console.warn('Error fetching profiles for global leaderboard:', dbErr.message);
    }

    if (dbProfiles.length === 0) {
      return res.json({
        globalStats: {
          totalRegisteredUsers: 0,
          totalSolvedWorldwide: 0,
          activeToday: 0,
          highestStreak: 0
        },
        leaderboard: []
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const userIds = dbProfiles.map((p) => p.id);

    // 2. Query real daily_activity for all registered users
    let activityStatsMap = new Map();
    try {
      const { data: activityRows } = await supabase
        .from('daily_activity')
        .select('user_id, activity_date, solved_count')
        .in('user_id', userIds);

      (activityRows || []).forEach((row) => {
        if (!activityStatsMap.has(row.user_id)) {
          activityStatsMap.set(row.user_id, { todayCount: 0, platformTotal: 0, dates: [] });
        }
        const stats = activityStatsMap.get(row.user_id);
        const solved = row.solved_count || 0;
        stats.platformTotal += solved;
        if (row.activity_date === todayDate) {
          stats.todayCount = solved;
        }
        if (solved > 0) {
          stats.dates.push(row.activity_date);
        }
      });
    } catch (actErr) {
      console.warn('Error reading daily_activity for global leaderboard:', actErr.message);
    }

    // 3. Query real user_progress for difficulty breakdown & solved problems count
    let progressStatsMap = new Map();
    try {
      const { data: progressRows } = await supabase
        .from('user_progress')
        .select('user_id, status, problem_id, solved_at, problems(difficulty)')
        .in('user_id', userIds)
        .eq('status', 'solved');

      (progressRows || []).forEach((row) => {
        if (!progressStatsMap.has(row.user_id)) {
          progressStatsMap.set(row.user_id, { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, todaySolved: 0 });
        }
        const stats = progressStatsMap.get(row.user_id);
        stats.totalSolved += 1;

        const diff = row.problems?.difficulty;
        if (diff === 'Easy') stats.easyCount += 1;
        else if (diff === 'Medium') stats.mediumCount += 1;
        else if (diff === 'Hard') stats.hardCount += 1;

        if (row.solved_at && row.solved_at.startsWith(todayDate)) {
          stats.todaySolved += 1;
        }
      });
    } catch (progErr) {
      console.warn('Error reading user_progress for global leaderboard:', progErr.message);
    }

    // 4. Optionally fetch live LeetCode profile stats for users with leetcode_username
    const realLeaderboardEntries = await Promise.all(
      dbProfiles.map(async (p) => {
        const isSelf = p.id === currentUserId;

        const actStats = activityStatsMap.get(p.id) || { todayCount: 0, platformTotal: 0, dates: [] };
        const progStats = progressStatsMap.get(p.id) || { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, todaySolved: 0 };

        let todayCount = Math.max(actStats.todayCount, progStats.todaySolved);
        let platformTotal = Math.max(actStats.platformTotal, progStats.totalSolved);
        let easyCount = progStats.easyCount;
        let mediumCount = progStats.mediumCount;
        let hardCount = progStats.hardCount;
        let liveAvatar = p.avatar_url;
        let realName = p.name || p.username || p.leetcode_username || 'GrindFam User';

        // Fetch live LeetCode stats if user has leetcode_username and DB stats are low
        if (p.leetcode_username && p.leetcode_username.trim()) {
          try {
            const lcData = await fetchUserTodayData(p.leetcode_username);
            if (!lcData.error) {
              if (lcData.totalSolved > platformTotal) {
                platformTotal = lcData.totalSolved;
              }
              if (lcData.todayCount > todayCount) {
                todayCount = lcData.todayCount;
              }
              if (lcData.easyCount > easyCount) easyCount = lcData.easyCount;
              if (lcData.mediumCount > mediumCount) mediumCount = lcData.mediumCount;
              if (lcData.hardCount > hardCount) hardCount = lcData.hardCount;
              if (lcData.avatarUrl && !liveAvatar) {
                liveAvatar = lcData.avatarUrl;
              }
            }
          } catch (lcErr) {
            // Silence error and use DB stats
          }
        }

        // Calculate REAL active streak
        let streak = 0;
        if (actStats.dates && actStats.dates.length > 0) {
          const sortedDates = Array.from(new Set(actStats.dates)).sort().reverse();
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
        } else if (todayCount > 0) {
          streak = 1;
        }

        // Real Tier based on total solved
        let tier = 'Apprentice';
        if (platformTotal >= 500) tier = 'Grandmaster';
        else if (platformTotal >= 250) tier = 'Master';
        else if (platformTotal >= 100) tier = 'Expert';
        else if (platformTotal >= 30) tier = 'Knight';

        const xp = platformTotal * 50 + streak * 20;

        const userAvatar = liveAvatar || p.avatar_url || p.avatarUrl || null;

        return {
          id: p.id,
          name: realName,
          username: p.username || p.leetcode_username || 'grinder',
          leetcodeUsername: p.leetcode_username || p.username || 'user',
          avatarUrl: userAvatar,
          avatar_url: userAvatar,
          country: p.country || '🌐 Worldwide',
          countryCode: p.country_code || 'WW',
          targetCompany: p.target_company || 'Software Engineer',
          tier,
          platformTotal,
          todayCount,
          easyCount,
          mediumCount,
          hardCount,
          streak,
          xp,
          targetHit: todayCount >= 3,
          isSelf,
          isRegistered: true,
          joinedAt: p.created_at || new Date().toISOString()
        };
      })
    );

    // Sort default by platformTotal descending
    realLeaderboardEntries.sort((a, b) => b.platformTotal - a.platformTotal);

    // Assign real rankings
    const rankedLeaderboard = realLeaderboardEntries.map((item, idx) => {
      let badge = null;
      if (idx === 0 && item.platformTotal > 0) badge = '🥇 Worldwide #1';
      else if (idx === 1 && item.platformTotal > 0) badge = '🥈 Worldwide #2';
      else if (idx === 2 && item.platformTotal > 0) badge = '🥉 Worldwide #3';
      else if (item.streak >= 7) badge = `🔥 ${item.streak} Day Streak`;
      else if (item.platformTotal >= 500) badge = '👑 Grandmaster';

      return {
        ...item,
        rank: idx + 1,
        badge
      };
    });

    const totalSolvedWorldwide = rankedLeaderboard.reduce((sum, item) => sum + (item.platformTotal || 0), 0);
    const activeToday = rankedLeaderboard.filter((item) => (item.todayCount || 0) > 0).length;
    const highestStreak = Math.max(0, ...rankedLeaderboard.map((item) => item.streak || 0));

    return res.json({
      globalStats: {
        totalRegisteredUsers: rankedLeaderboard.length,
        totalSolvedWorldwide,
        activeToday,
        highestStreak
      },
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    console.error('Error in getGlobalLeaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDashboardData,
  syncLeetCodeData,
  syncUserLeetCodeSolvedProblems,
  getGlobalLeaderboard
};

