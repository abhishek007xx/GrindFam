const fs = require('fs');
const https = require('https');
const path = require('path');

const fetchRawJs = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

// Extract leetcode slug or create clean slug
function getSlug(problemTitle, url) {
  if (url && url.includes('leetcode.com/problems/')) {
    const parts = url.split('leetcode.com/problems/')[1].split('/')[0];
    if (parts) return parts;
  }
  return problemTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function run() {
  console.log("==================================================");
  console.log("🚀 Ingesting Authentic Apna College (Shradha Didi) Sheet");
  console.log("==================================================");

  const rawJs = await fetchRawJs('https://raw.githubusercontent.com/jatinder14/Apna-College-DSA-Sheet/main/src/data/ApnaCollege.js');
  
  // Convert JS export to JSON by evaluating safely
  let jsonString = rawJs.replace(/^export default\s*/, '').split(';')[0].trim();
  const rawObj = eval('(' + jsonString + ')');

  console.log(`Loaded ${rawObj.sheetName} with ${rawObj.totalQuestions} questions across ${rawObj.problems.length} topics.`);

  // Transform into our standard sheet steps format
  const steps = rawObj.problems.map(topicObj => {
    const topicName = topicObj.topicName || topicObj.name || 'General';
    const problems = (topicObj.questions || []).map(q => {
      const title = q.Problem || q.name || 'Problem';
      const url = q.URL || q.problemUrl || '';
      const slug = getSlug(title, url);
      const diff = q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)) : 'Medium';

      return {
        title: title,
        leetcode_slug: slug,
        leetcode_url: url || `https://leetcode.com/problems/${slug}/`,
        difficulty: diff,
        youtube_tutorial_url: q.URL2 || null,
        topic_tags: [topicName]
      };
    });

    return {
      step_name: topicName,
      problems: problems
    };
  });

  const SHEETS_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');
  const sheets = JSON.parse(fs.readFileSync(SHEETS_PATH, 'utf8'));

  const shradhaIndex = sheets.findIndex(s => s.slug === 'shradha-aman-dsa');

  const newShradhaSheet = {
    sheet_name: 'DSA by Shradha Didi & Aman Bhaiya',
    creator_name: 'Shradha Khapra & Aman Dhattarwal',
    slug: 'shradha-aman-dsa',
    popularity_rank: 7,
    total_problems_count: rawObj.totalQuestions,
    steps: steps
  };

  if (shradhaIndex !== -1) {
    sheets[shradhaIndex] = newShradhaSheet;
  } else {
    sheets.push(newShradhaSheet);
  }

  fs.writeFileSync(SHEETS_PATH, JSON.stringify(sheets, null, 2));
  console.log(`✅ Saved authentic Shradha Didi & Aman Bhaiya DSA sheet (${rawObj.totalQuestions} problems across ${steps.length} categories) to sheets_data.json!`);
}

run().catch(console.error);
