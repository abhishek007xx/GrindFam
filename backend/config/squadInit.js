const supabase = require('./supabaseClient');

/**
 * Generate a random 6-character uppercase alphanumeric squad code
 * e.g., "SQUAD-9K21"
 */
const generateSquadCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randStr = '';
  for (let i = 0; i < 4; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SQUAD-${randStr}`;
};

/**
 * Helper to ensure squads and squad_members tables exist in Supabase.
 */
const ensureSquadTables = async () => {
  try {
    const { error: testSquadError } = await supabase.from('squads').select('id').limit(1);
    if (testSquadError && testSquadError.code === '42P01') {
      console.warn('⚠️ Table "squads" does not exist in Supabase yet. Please execute schema.sql in Supabase SQL Editor.');
    }
  } catch (err) {
    console.error('Error checking squad tables:', err);
  }
};

module.exports = {
  generateSquadCode,
  ensureSquadTables
};
