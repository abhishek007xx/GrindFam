const axios = require('axios');
const supabase = require('../config/supabaseClient');

const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetch LeetCode stats and today's solved problems for a user with retry & timeout protection.
 * @param {string} username - LeetCode username
 * @param {string} [userId] - Optional Supabase User UUID
 * @returns {Promise<Object>} User data with totalSolved, todayCount, difficulty breakdown
 */
const fetchUserTodayData = async (username, userId = null) => {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return {
      username: 'Unknown',
      totalSolved: 0,
      todayCount: 0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      targetHit: false,
      error: 'Username not provided'
    };
  }

  const cleanUsername = username.trim();

  const graphqlQuery = {
    query: `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            userAvatar
            realName
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $username, limit: 100) {
          title
          titleSlug
          timestamp
        }
      }
    `,
    variables: { username: cleanUsername }
  };

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://leetcode.com/graphql',
        graphqlQuery,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': `https://leetcode.com/${cleanUsername}/`
          },
          timeout: 8000
        }
      );

      if (response.data?.errors) {
        throw new Error(`GraphQL error: ${response.data.errors[0]?.message || 'Unknown GraphQL error'}`);
      }

      const data = response.data?.data;

      if (!data || !data.matchedUser) {
        return {
          username: cleanUsername,
          totalSolved: 0,
          todayCount: 0,
          easyCount: 0,
          mediumCount: 0,
          hardCount: 0,
          targetHit: false,
          error: 'User not found or private profile'
        };
      }

      // Extract total & difficulty breakdown solved problems
      const acSubmissions = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
      const allAc = acSubmissions.find((sub) => sub.difficulty === 'All');
      const easyAc = acSubmissions.find((sub) => sub.difficulty === 'Easy');
      const mediumAc = acSubmissions.find((sub) => sub.difficulty === 'Medium');
      const hardAc = acSubmissions.find((sub) => sub.difficulty === 'Hard');

      const totalSolved = allAc ? allAc.count : 0;
      const easyCount = easyAc ? easyAc.count : 0;
      const mediumCount = mediumAc ? mediumAc.count : 0;
      const hardCount = hardAc ? hardAc.count : 0;

      // Robust Today Date Matching (24-hour window + UTC date + Local date)
      const now = new Date();
      const todayUtcStr = now.toISOString().split('T')[0];
      const todayLocalStr = formatDateStr(now);

      const recentSubmissions = data.recentAcSubmissionList || [];
      const todayProblemSlugs = new Set();
      const allSolvedSlugs = new Set();

      recentSubmissions.forEach((sub) => {
        const slug = sub.titleSlug || sub.title;
        if (slug) allSolvedSlugs.add(slug);

        let rawTs = parseInt(sub.timestamp, 10);
        if (!isNaN(rawTs) && rawTs > 0) {
          const subTimestampMs = rawTs < 1e11 ? rawTs * 1000 : rawTs;
          const subDate = new Date(subTimestampMs);
          const subUtcStr = subDate.toISOString().split('T')[0];
          const subLocalStr = formatDateStr(subDate);

          const diffHours = (now.getTime() - subTimestampMs) / (1000 * 60 * 60);

          if ((diffHours >= 0 && diffHours <= 24) || subUtcStr === todayUtcStr || subLocalStr === todayLocalStr) {
            todayProblemSlugs.add(slug);
          }
        }
      });

      const todayCount = todayProblemSlugs.size;
      const avatarUrl = data.matchedUser.profile?.userAvatar || null;

      if (userId && allSolvedSlugs.size > 0) {
        const progressEntries = Array.from(allSolvedSlugs).map(slug => ({
          user_id: userId,
          problem_id: slug,
          status: 'solved',
          solve_count: 1,
          solved_at: new Date().toISOString()
        }));
        try {
          await supabase.from('user_progress').upsert(progressEntries, { onConflict: 'user_id,problem_id' });
        } catch (upsertErr) {
          console.warn('user_progress upsert warning in leetcodeService:', upsertErr.message);
        }
      }

      return {
        username: cleanUsername,
        avatarUrl,
        totalSolved,
        todayCount,
        easyCount,
        mediumCount,
        hardCount,
        targetHit: todayCount >= 5,
        recentAcSubmissions: Array.from(allSolvedSlugs),
        todayAcSubmissions: Array.from(todayProblemSlugs),
        error: null
      };
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 1000;
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error(`Error fetching LeetCode data for user ${cleanUsername}:`, error.message);
        return {
          username: cleanUsername,
          totalSolved: 0,
          todayCount: 0,
          easyCount: 0,
          mediumCount: 0,
          hardCount: 0,
          targetHit: false,
          error: error.message || 'Failed to fetch LeetCode data'
        };
      }
    }
  }
};

/**
 * In-memory cache to avoid re-syncing the same user's history multiple times per day.
 * Key: `${userId}`, Value: date string 'YYYY-MM-DD' of last sync
 */
const syncCache = {};

/**
 * Fetch historical submission calendar for a user from LeetCode and bulk-upsert into daily_activity.
 * @param {string} userId - Supabase User UUID
 * @param {string} username - LeetCode username
 * @param {boolean} forceSync - Bypass 24h cache throttle
 */
const syncUserLeetCodeHistory = async (userId, username, forceSync = false) => {
  if (!userId || !username) return;

  if (forceSync) {
    delete syncCache[userId];
  }

  const todayDate = new Date().toISOString().split('T')[0];
  if (!forceSync && syncCache[userId] === todayDate) {
    return;
  }

  const cleanUsername = username.trim();

  const graphqlQuery = {
    query: `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            submissionCalendar
          }
        }
      }
    `,
    variables: { username: cleanUsername }
  };

  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      graphqlQuery,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': `https://leetcode.com/${cleanUsername}/`
        },
        timeout: 8000
      }
    );

    const calStr = response.data?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!calStr || calStr === '{}') return;

    const parsedCalendar = JSON.parse(calStr);
    const entries = Object.entries(parsedCalendar);
    if (entries.length === 0) return;

    const activityRows = entries
      .map(([timestampSec, count]) => {
        const dateStr = new Date(parseInt(timestampSec, 10) * 1000).toISOString().split('T')[0];
        return {
          user_id: userId,
          activity_date: dateStr,
          solved_count: parseInt(count, 10) || 0,
          updated_at: new Date().toISOString()
        };
      })
      .filter(row => row.activity_date !== todayDate);

    if (activityRows.length === 0) {
      syncCache[userId] = todayDate;
      return;
    }

    const existingDates = activityRows.map(r => r.activity_date);
    let existingMap = {};
    try {
      const { data: existingRows } = await supabase
        .from('daily_activity')
        .select('activity_date, solved_count')
        .eq('user_id', userId)
        .in('activity_date', existingDates);

      (existingRows || []).forEach(row => {
        existingMap[row.activity_date] = row.solved_count || 0;
      });
    } catch (fetchErr) {
      console.warn(`Could not fetch existing activity for max-merge: ${fetchErr.message}`);
    }

    const mergedRows = activityRows.map(row => ({
      ...row,
      solved_count: Math.max(row.solved_count, existingMap[row.activity_date] || 0)
    }));

    const chunkSize = 100;
    for (let i = 0; i < mergedRows.length; i += chunkSize) {
      const chunk = mergedRows.slice(i, i + chunkSize);
      await supabase
        .from('daily_activity')
        .upsert(chunk, { onConflict: 'user_id, activity_date' });
    }

    syncCache[userId] = todayDate;
  } catch (error) {
    console.error(`Error syncing LeetCode history for user ${cleanUsername}:`, error.message);
  }
};

module.exports = {
  fetchUserTodayData,
  syncUserLeetCodeHistory
};
