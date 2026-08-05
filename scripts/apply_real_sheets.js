const fs = require('fs');
const https = require('https');
const path = require('path');

const SHEETS_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');
let sheets = JSON.parse(fs.readFileSync(SHEETS_PATH, 'utf8'));

// Helper for fetching URLs
const fetchJson = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => resolve(JSON.parse(data.replace(/^\uFEFF/, ''))));
  }).on('error', reject);
});

const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const lcCache = new Map();
const fetchLeetcodeTag = (titleSlug) => new Promise((resolve) => {
  if(lcCache.has(titleSlug)) return resolve(lcCache.get(titleSlug));
  
  const data = JSON.stringify({
    query: 'query getQuestionDetail($titleSlug: String!) { question(titleSlug: $titleSlug) { topicTags { name } } }',
    variables: { titleSlug }
  });
  const req = https.request({
    hostname: 'leetcode.com', port: 443, path: '/graphql', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, res => {
    let resData = '';
    res.on('data', d => resData += d);
    res.on('end', () => {
      try {
        const json = JSON.parse(resData);
        const tags = json.data?.question?.topicTags;
        const result = tags && tags.length > 0 ? tags[0].name : 'General';
        lcCache.set(titleSlug, result);
        resolve(result);
      } catch (e) { resolve('General'); }
    });
  });
  req.on('error', () => resolve('General'));
  req.write(data);
  req.end();
});

async function run() {
  console.log("Fetching authentic trackers...");
  const babbarData = await fetchJson('https://raw.githubusercontent.com/AsishRaju/450-DSA/master/450DSA.json');
  const neetcodeData = await fetchJson('https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json');
  
  const babbarMap = new Map();
  Object.keys(babbarData).forEach(sheetKey => {
     babbarData[sheetKey].forEach(p => {
        let title = p['Problem: '] || p['Problem:'];
        if(title) babbarMap.set(normalize(title), p['Topic:'] || 'General');
     });
  });

  const neetcodeMap = new Map();
  neetcodeData.forEach(p => {
     if (p.link) {
         let slug = p.link.replace('/', '');
         neetcodeMap.set(slug, p.pattern);
     }
  });

  console.log("Gathering all unique Leetcode slugs to fetch...");
  const slugsToFetch = new Set();
  
  for (let s of sheets) {
    if (s.slug === 'strivers-a2z') continue;
    let isBroken = s.steps.some(st => st.step_name && st.step_name.includes('Problems)'));
    if (!isBroken) continue;
    
    s.steps.forEach(st => st.problems.forEach(p => {
        if (p.leetcode_slug) {
            let trueTopic = null;
            if (s.slug.includes('babbar')) trueTopic = babbarMap.get(normalize(p.title));
            if (s.slug.includes('neetcode') || s.slug.includes('blind-75')) trueTopic = neetcodeMap.get(p.leetcode_slug);
            if (!trueTopic) slugsToFetch.add(p.leetcode_slug);
        }
    }));
  }

  const slugArray = Array.from(slugsToFetch);
  console.log(`Need to fetch tags for ${slugArray.length} unique Leetcode slugs...`);
  
  const BATCH_SIZE = 20;
  for (let i = 0; i < slugArray.length; i += BATCH_SIZE) {
      const batch = slugArray.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(slug => fetchLeetcodeTag(slug)));
      process.stdout.write(`\rFetched ${Math.min(i + BATCH_SIZE, slugArray.length)} / ${slugArray.length}`);
  }
  console.log('\nDone fetching tags!');

  let totalApiHits = slugArray.length;
  
  for (let s of sheets) {
    if (s.slug === 'strivers-a2z') continue;
    let isBroken = s.steps.some(st => st.step_name && st.step_name.includes('Problems)'));
    if (!isBroken) continue;
    
    console.log(`Fixing broken sheet: ${s.sheet_name}`);
    let allProblems = [];
    s.steps.forEach(st => allProblems.push(...st.problems));
    
    let trueCategories = new Map();
    
    for (let p of allProblems) {
        let trueTopic = 'General';
        
        if (s.slug.includes('babbar')) {
            trueTopic = babbarMap.get(normalize(p.title)) || 'General';
        } else if (s.slug.includes('neetcode') || s.slug.includes('blind-75')) {
            trueTopic = neetcodeMap.get(p.leetcode_slug) || 'General';
        }
        
        if (trueTopic === 'General' && p.leetcode_slug) {
            trueTopic = lcCache.get(p.leetcode_slug) || 'General';
        }
        
        p.topic_tags = [trueTopic];
        if (!trueCategories.has(trueTopic)) trueCategories.set(trueTopic, []);
        trueCategories.get(trueTopic).push(p);
    }
    
    s.steps = Array.from(trueCategories.entries()).map(([cat, probs]) => ({
        step_name: cat,
        problems: probs
    }));
  }
  
  fs.writeFileSync(SHEETS_PATH, JSON.stringify(sheets, null, 2));
  console.log("Updated sheets_data.json!");
}

run().catch(console.error);
