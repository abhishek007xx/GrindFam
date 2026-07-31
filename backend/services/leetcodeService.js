const axios = require('axios');
const supabase = require('../config/supabaseClient');

/**
 * Fetch LeetCode stats and today's solved problems for a user.
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} User data with totalSolved, todayCount, and targetHit
 */
const fetchUserTodayData = async (username) => {
  if (!username) {
    return {
      username: 'Unknown',
      totalSolved: 0,
      todayCount: 0,
      targetHit: false,
      error: 'Username not provided'
    };
  }

  const graphqlQuery = {
    query: `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $username, limit: 20) {
          title
          titleSlug
          timestamp
        }
      }
    `,
    variables: { username }
  };

  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      graphqlQuery,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 8000
      }
    );

    const data = response.data?.data;

    if (!data || !data.matchedUser) {
      return {
        username,
        totalSolved: 0,
        todayCount: 0,
        targetHit: false,
        error: 'User not found or private profile'
      };
    }

    // Extract total solved problems
    const acSubmissions = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const allAc = acSubmissions.find((sub) => sub.difficulty === 'All');
    const totalSolved = allAc ? allAc.count : 0;

    // Calculate today's UTC start timestamp (00:00:00 UTC in ms)
    const now = new Date();
    const todayStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    // Process recent AC submissions
    const recentSubmissions = data.recentAcSubmissionList || [];
    
    // Filter submissions made today and count unique problem slugs
    const todayProblemSlugs = new Set();

    recentSubmissions.forEach((sub) => {
      // timestamp is in seconds (unix epoch)
      const subTimestampMs = parseInt(sub.timestamp, 10) * 1000;
      if (subTimestampMs >= todayStartMs) {
        todayProblemSlugs.add(sub.titleSlug || sub.title);
      }
    });

    const todayCount = todayProblemSlugs.size;

    return {
      username,
      totalSolved,
      todayCount,
      targetHit: todayCount >= 5,
      error: null
    };
  } catch (error) {
    console.error(`Error fetching LeetCode data for user ${username}:`, error.message);
    return {
      username,
      totalSolved: 0,
      todayCount: 0,
      targetHit: false,
      error: 'Failed to fetch LeetCode data'
    };
  }
};

/**
 * Fetch historical submission calendar for a user from LeetCode and bulk-upsert into daily_activity.
 * @param {string} userId - Supabase User UUID
 * @param {string} username - LeetCode username
 */
const syncUserLeetCodeHistory = async (userId, username) => {
  if (!userId || !username) return;

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
    variables: { username }
  };

  try {
    const response = await axios.post(
      'https://leetcode.com/graphql',
      graphqlQuery,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': `https://leetcode.com/${username}/`
        },
        timeout: 10000
      }
    );

    const calStr = response.data?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!calStr || calStr === '{}') return;

    const parsedCalendar = JSON.parse(calStr);
    const entries = Object.entries(parsedCalendar);
    if (entries.length === 0) return;

    const activityRows = entries.map(([timestampSec, count]) => {
      const dateStr = new Date(parseInt(timestampSec, 10) * 1000).toISOString().split('T')[0];
      return {
        user_id: userId,
        activity_date: dateStr,
        solved_count: parseInt(count, 10) || 0,
        updated_at: new Date().toISOString()
      };
    });

    // Bulk upsert into Supabase daily_activity in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < activityRows.length; i += chunkSize) {
      const chunk = activityRows.slice(i, i + chunkSize);
      await supabase
        .from('daily_activity')
        .upsert(chunk, { onConflict: 'user_id, activity_date' });
    }
  } catch (error) {
    console.error(`Error syncing LeetCode history for user ${username}:`, error.message);
  }
};

module.exports = {
  fetchUserTodayData,
  syncUserLeetCodeHistory
};

