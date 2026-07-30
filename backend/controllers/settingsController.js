const supabase = require('../config/supabaseClient');

/**
 * GET /api/settings/target
 * Fetch current group daily target
 */
const getGroupTarget = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_settings')
      .select('daily_target')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching group target:', error);
      return res.status(500).json({ error: 'Database error fetching group target' });
    }

    const dailyTarget = data ? data.daily_target : 5;

    return res.json({ dailyTarget });
  } catch (error) {
    console.error('Error in getGroupTarget:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT /api/settings/target
 * Update group daily target
 */
const updateGroupTarget = async (req, res) => {
  try {
    const { target } = req.body;
    const numericTarget = parseInt(target, 10);

    if (isNaN(numericTarget) || numericTarget < 1) {
      return res.status(400).json({ error: 'Please provide a valid target number (minimum 1).' });
    }

    const { data, error } = await supabase
      .from('group_settings')
      .upsert({
        id: 1,
        daily_target: numericTarget,
        updated_at: new Date().toISOString()
      })
      .select('daily_target')
      .single();

    if (error) {
      console.error('Error updating group target:', error);
      return res.status(500).json({ error: 'Failed to update target' });
    }

    return res.json({
      dailyTarget: data.daily_target,
      message: 'Group target updated successfully!'
    });
  } catch (error) {
    console.error('Error in updateGroupTarget:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getGroupTarget,
  updateGroupTarget
};
