const fs = require('fs');
const path = require('path');

const companiesPath = path.join(__dirname, '..', 'src', 'data', 'companies_data.json');
const sheetsPath = path.join(__dirname, '..', 'src', 'data', 'sheets_data.json');

const rawCompanies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const rawSheets = JSON.parse(fs.readFileSync(sheetsPath, 'utf8'));

// TRANSFORM COMPANIES
const transformedCompanies = rawCompanies.map(c => {
  // Extract problems from steps > subtopics
  const problems = [];
  
  if (c.steps) {
    c.steps.forEach(step => {
      if (step.subtopics) {
        step.subtopics.forEach(sub => {
          if (sub.problems) {
            sub.problems.forEach(p => {
              // Extract leetcode slug from URL
              let leetcode_slug = p.leetcodeUrl ? p.leetcodeUrl.replace('https://leetcode.com/problems/', '').replace('/', '') : p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
              
              problems.push({
                leetcode_slug: leetcode_slug,
                title: p.title,
                difficulty: p.difficulty,
                topic_tags: [step.title, sub.title],
                frequency_score: 8,
                youtube_tutorial_url: p.videoUrl || null
              });
            });
          }
        });
      }
    });
  }

  const slug = c.id.replace('company-', '');
  return {
    slug: slug,
    company_name: c.companyName || c.title,
    logo_url: c.logo || `https://unavatar.io/${slug}.com`,
    roles: [
      {
        role_name: "Software Engineer",
        level: "SDE-1 / SDE-2",
        guidelines: {
          interview_format: ["Online Assessment", "Data Structures", "System Design"],
          key_topics_weightage: {"Algorithms": "50%"},
          behavioral_focus: "Demonstrate Googleyness or equivalent core values.",
          common_rejection_reasons: ["Poor communication", "Missed edge cases"]
        },
        problems: problems
      }
    ]
  };
});

// TRANSFORM SHEETS
const transformedSheets = rawSheets.map(s => {
  const steps = [];
  
  if (s.steps) {
    s.steps.forEach(step => {
      let stepProbs = [];
      if (step.subtopics) {
        step.subtopics.forEach(sub => {
          if (sub.problems) {
            sub.problems.forEach(p => {
              let leetcode_slug = p.leetcodeUrl ? p.leetcodeUrl.replace('https://leetcode.com/problems/', '').replace('/', '') : p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
              stepProbs.push({
                leetcode_slug: leetcode_slug,
                title: p.title,
                difficulty: p.difficulty,
                topic_tags: [sub.title],
                youtube_tutorial_url: p.videoUrl || null
              });
            });
          }
        });
      } else if (step.problems) {
         step.problems.forEach(p => {
              let leetcode_slug = p.leetcodeUrl ? p.leetcodeUrl.replace('https://leetcode.com/problems/', '').replace('/', '') : p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
              stepProbs.push({
                leetcode_slug: leetcode_slug,
                title: p.title,
                difficulty: p.difficulty,
                topic_tags: [],
                youtube_tutorial_url: p.videoUrl || null
              });
          });
      }
      
      if (stepProbs.length > 0) {
        steps.push({
          step_name: step.title,
          problems: stepProbs
        });
      }
    });
  }

  const slug = (s.id ? s.id.replace('sheet-', '') : s.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  let total = 0;
  steps.forEach(st => total += st.problems.length);

  return {
    sheet_name: s.title,
    creator_name: s.author,
    slug: slug,
    total_problems_count: s.questionsCount || total,
    steps: steps
  };
});

// Write files back
fs.writeFileSync(companiesPath, JSON.stringify(transformedCompanies, null, 2));
fs.writeFileSync(sheetsPath, JSON.stringify(transformedSheets, null, 2));

const feCompaniesDest = path.join(__dirname, '..', 'frontend', 'src', 'data', 'companies_data.json');
const feSheetsDest = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');

fs.writeFileSync(feCompaniesDest, JSON.stringify(transformedCompanies, null, 2));
fs.writeFileSync(feSheetsDest, JSON.stringify(transformedSheets, null, 2));

console.log("Transformed data to fit local cc3c1a4 schema!");
