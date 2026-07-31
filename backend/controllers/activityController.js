const supabase = require('../config/supabaseClient');

/**
 * GET /api/activity/heatmap
 * Returns the last 365 days of daily_activity for the logged-in user
 */
const getHeatmapData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate date range: last 365 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const { data: rows, error } = await supabase
      .from('daily_activity')
      .select('activity_date, solved_count')
      .eq('user_id', userId)
      .gte('activity_date', startStr)
      .lte('activity_date', endStr)
      .order('activity_date', { ascending: true });

    if (error) {
      console.error('Error fetching heatmap data:', error);
      return res.status(500).json({ error: 'Failed to fetch activity data' });
    }

    // Build a map of date -> solved_count
    const activityMap = {};
    (rows || []).forEach((row) => {
      activityMap[row.activity_date] = row.solved_count || 0;
    });

    // Build full 365-day array
    const days = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dateStr = cursor.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: activityMap[dateStr] || 0
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Compute stats
    const totalSolved = days.reduce((sum, d) => sum + d.count, 0);
    const activeDays = days.filter((d) => d.count > 0).length;
    const maxInDay = days.reduce((max, d) => Math.max(max, d.count), 0);

    // Current streak (consecutive days with count > 0, ending today or yesterday)
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else {
        // Allow today to be 0 if it's still early, check yesterday
        if (i === days.length - 1) continue;
        break;
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const d of days) {
      if (d.count > 0) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
      else { tempStreak = 0; }
    }

    // Compute current week (Mon->Sun) activity array
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);

    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      weeklyData.push(activityMap[dStr] || 0);
    }

    return res.json({
      days,
      weeklyData,
      stats: {
        totalSolved,
        activeDays,
        maxInDay,
        currentStreak,
        longestStreak
      }
    });
  } catch (err) {
    console.error('Error in getHeatmapData:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getHeatmapData };
