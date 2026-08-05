const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_SLUGS = [
  'striver-s-a2z-dsa-course-sheet',
  'striver-sde',
  'love-babbar',
  'neetcode-150',
  'blind-75',
  'fraz-dsa',
  'code-army',
  'shradha-aman-dsa'
];

async function pruneSheets() {
  console.log("==================================================");
  console.log("✂️ Starting Sheet Pruning Script (Keeping 8 Core Sheets)");
  console.log("==================================================");

  const SHEETS_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');
  const sheets = JSON.parse(fs.readFileSync(SHEETS_PATH, 'utf8'));

  const keptSheets = sheets.filter(s => TARGET_SLUGS.includes(s.slug));

  console.log(`\nLocal JSON sheets count before: ${sheets.length}`);
  console.log(`Local JSON sheets count after:  ${keptSheets.length}`);
  console.log("Kept sheets:");
  keptSheets.forEach((s, i) => console.log(`  ${i + 1}. ${s.sheet_name} (${s.total_problems_count || 0} problems)`));

  // Save pruned JSON
  fs.writeFileSync(SHEETS_PATH, JSON.stringify(keptSheets, null, 2));
  console.log("\n✅ Saved pruned sheets to frontend/src/data/sheets_data.json!");

  // Now clean up Supabase Database
  console.log("\n🧹 Cleaning up Supabase database...");
  const { data: dbSheets, error: fetchErr } = await supabase.from('sheets').select('id, name, slug');

  if (fetchErr) {
    console.error("❌ Error fetching Supabase sheets:", fetchErr.message);
    return;
  }

  const sheetsToDelete = dbSheets.filter(s => !TARGET_SLUGS.includes(s.slug));
  console.log(`Found ${sheetsToDelete.length} extra sheets to delete from database.`);

  for (let s of sheetsToDelete) {
    // Delete problems for this sheet
    const { error: probDelErr } = await supabase.from('problems').delete().eq('source_id', s.id).eq('source_type', 'sheet');
    if (probDelErr) console.error(`Error deleting problems for ${s.name}:`, probDelErr.message);

    // Delete sheet
    const { error: sheetDelErr } = await supabase.from('sheets').delete().eq('id', s.id);
    if (sheetDelErr) console.error(`Error deleting sheet ${s.name}:`, sheetDelErr.message);
    else console.log(`🗑️ Deleted sheet from DB: ${s.name} (${s.slug})`);
  }

  console.log("\n==================================================");
  console.log("🎉 Pruning Complete! Database and local data now contain ONLY the 8 core sheets!");
  console.log("==================================================");
}

pruneSheets().catch(console.error);
