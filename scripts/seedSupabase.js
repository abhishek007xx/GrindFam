const fs = require('fs');
const path = require('path');

// Resolve node_modules path from backend or frontend if not in root
const rootDir = path.resolve(__dirname, '..');
const backendModules = path.join(rootDir, 'backend', 'node_modules');
const frontendModules = path.join(rootDir, 'frontend', 'node_modules');

if (fs.existsSync(backendModules)) {
  module.paths.push(backendModules);
}
if (fs.existsSync(frontendModules)) {
  module.paths.push(frontendModules);
}

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, 'backend', '.env') });
dotenv.config({ path: path.join(rootDir, 'frontend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Missing Supabase URL or Key in environment variables.");
  console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function chunkUpsert(table, data, onConflict, batchSize = 50) {
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) {
      console.error(`❌ Error upserting into ${table} (batch ${i / batchSize + 1}):`, error.message);
      throw error;
    }
  }
}

async function seedData() {
  console.log("==================================================");
  console.log("Starting Supabase Data Seeding Script");
  console.log("==================================================");

  // 1. Read JSON Data Files
  const companiesPath = path.join(rootDir, 'frontend', 'src', 'data', 'companies_data.json');
  const sheetsPath = path.join(rootDir, 'frontend', 'src', 'data', 'sheets_data.json');

  if (!fs.existsSync(companiesPath) || !fs.existsSync(sheetsPath)) {
    console.error(`❌ Error: Data files missing. Expected ${companiesPath} and ${sheetsPath}`);
    process.exit(1);
  }

  const companiesData = JSON.parse(fs.readFileSync(companiesPath, 'utf-8'));
  const sheetsData = JSON.parse(fs.readFileSync(sheetsPath, 'utf-8'));

  console.log(`📦 Loaded ${companiesData.length} companies and ${sheetsData.length} sheets.`);

  // -------------------------------------------------------------------------
  // 2. Seed Companies & Company Tracks
  // -------------------------------------------------------------------------
  console.log("\n🏢 Seeding Companies & Tracks...");

  const companiesToUpsert = companiesData.map(c => ({
    name: c.company_name,
    slug: c.slug,
    logo_url: c.logo_url
  }));

  const { data: seededCompanies, error: compErr } = await supabase
    .from('companies')
    .upsert(companiesToUpsert, { onConflict: 'slug' })
    .select('id, slug');

  if (compErr) {
    console.error("❌ Failed to upsert companies:", compErr.message);
    process.exit(1);
  }

  const companyMap = new Map();
  seededCompanies.forEach(c => companyMap.set(c.slug, c.id));

  // Seed Company Tracks
  const tracksToUpsert = [];

  for (const comp of companiesData) {
    const companyId = companyMap.get(comp.slug);
    if (!companyId) continue;

    for (const role of comp.roles) {
      tracksToUpsert.push({
        company_id: companyId,
        role: role.role_name,
        level: role.level,
        guidelines: role.guidelines || {},
        roadmap: { problems_count: role.problems ? role.problems.length : 0 }
      });
    }
  }

  const { data: seededTracks, error: trackErr } = await supabase
    .from('company_tracks')
    .upsert(tracksToUpsert, { onConflict: 'company_id,role,level' })
    .select('id, company_id, role, level');

  if (trackErr) {
    console.error("❌ Failed to upsert company_tracks:", trackErr.message);
    process.exit(1);
  }

  const trackKeyMap = new Map();
  seededTracks.forEach(t => {
    trackKeyMap.set(`${t.company_id}:${t.role}:${t.level}`, t.id);
  });

  // Prepare Company Problems
  const companyProblemsToUpsert = [];

  for (const comp of companiesData) {
    const companyId = companyMap.get(comp.slug);
    if (!companyId) continue;

    for (const role of comp.roles) {
      const trackId = trackKeyMap.get(`${companyId}:${role.role_name}:${role.level}`);
      if (!trackId) continue;

      for (const p of role.problems) {
        companyProblemsToUpsert.push({
          leetcode_slug: p.leetcode_slug,
          title: p.title,
          difficulty: p.difficulty || "Medium",
          topic_tags: p.topic_tags || [],
          source_type: 'company',
          source_id: trackId,
          frequency_score: p.frequency_score || 5,
          youtube_tutorial_url: p.youtube_tutorial_url || null,
          step_name: role.role_name
        });
      }
    }
  }

  // Deduplicate company problems
  const uniqueCompanyProbsMap = new Map();
  for (const p of companyProblemsToUpsert) {
    const key = `${p.source_type}:${p.source_id}:${p.leetcode_slug}`;
    if (!uniqueCompanyProbsMap.has(key)) {
      uniqueCompanyProbsMap.set(key, p);
    }
  }
  const deduplicatedCompanyProblems = Array.from(uniqueCompanyProbsMap.values());

  console.log(`📌 Upserting ${deduplicatedCompanyProblems.length} company problems...`);
  await chunkUpsert('problems', deduplicatedCompanyProblems, 'source_type,source_id,leetcode_slug');

  // -------------------------------------------------------------------------
  // 3. Seed Sheets & Sheet Problems
  // -------------------------------------------------------------------------
  console.log("\n📚 Seeding Sheets...");

  const sheetsToUpsert = sheetsData.map(s => ({
    name: s.sheet_name,
    creator: s.creator_name,
    slug: s.slug,
    total_problems: s.total_problems_count || 0
  }));

  const { data: seededSheets, error: sheetErr } = await supabase
    .from('sheets')
    .upsert(sheetsToUpsert, { onConflict: 'slug' })
    .select('id, slug');

  if (sheetErr) {
    console.error("❌ Failed to upsert sheets:", sheetErr.message);
    process.exit(1);
  }

  const sheetMap = new Map();
  seededSheets.forEach(s => sheetMap.set(s.slug, s.id));

  const sheetProblemsToUpsert = [];

  for (const sheet of sheetsData) {
    const sheetId = sheetMap.get(sheet.slug);
    if (!sheetId) continue;

    for (const step of sheet.steps) {
      for (const p of step.problems) {
        sheetProblemsToUpsert.push({
          leetcode_slug: p.leetcode_slug,
          title: p.title,
          difficulty: p.difficulty || "Medium",
          topic_tags: p.topic_tags || [],
          source_type: 'sheet',
          source_id: sheetId,
          frequency_score: 5,
          youtube_tutorial_url: p.youtube_tutorial_url || null,
          step_name: step.step_name
        });
      }
    }
  }

  // Deduplicate sheet problems
  const uniqueSheetProbsMap = new Map();
  for (const p of sheetProblemsToUpsert) {
    const key = `${p.source_type}:${p.source_id}:${p.leetcode_slug}`;
    if (!uniqueSheetProbsMap.has(key)) {
      uniqueSheetProbsMap.set(key, p);
    }
  }
  const deduplicatedSheetProblems = Array.from(uniqueSheetProbsMap.values());

  // Purge outdated sheet problems for active sheets before inserting fresh ones
  const activeSheetIds = Array.from(sheetMap.values());
  if (activeSheetIds.length > 0) {
    await supabase.from('problems').delete().eq('source_type', 'sheet').in('source_id', activeSheetIds);
  }

  console.log(`📌 Upserting ${deduplicatedSheetProblems.length} sheet problems...`);
  await chunkUpsert('problems', deduplicatedSheetProblems, 'source_type,source_id,leetcode_slug');

  console.log("\n==================================================");
  console.log("🎉 Supabase Data Seeding Completed Successfully!");
  console.log(`  - Companies: ${seededCompanies.length}`);
  console.log(`  - Company Tracks: ${seededTracks.length}`);
  console.log(`  - Company Problems: ${companyProblemsToUpsert.length}`);
  console.log(`  - Sheets: ${seededSheets.length}`);
  console.log(`  - Sheet Problems: ${sheetProblemsToUpsert.length}`);
  console.log("==================================================");
}

seedData().catch(err => {
  console.error("❌ Unhandled Seeding Error:", err);
  process.exit(1);
});
