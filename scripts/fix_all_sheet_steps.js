const fs = require('fs');
const path = require('path');

const SHEETS_PATH = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');
const sheets = JSON.parse(fs.readFileSync(SHEETS_PATH, 'utf8'));

console.log("Restructuring all sheet steps based on problem titles...");

sheets.forEach(sheet => {
  if (sheet.slug === 'strivers-a2z') return; // Striver A2Z is already multi-step
  
  const allProblems = [];
  if (sheet.steps) {
    sheet.steps.forEach(st => {
      if (st.problems) allProblems.push(...st.problems);
    });
  }
  
  if (allProblems.length === 0) return;
  
  const topicMap = new Map();
  
  allProblems.forEach(p => {
    let topic = 'General';
    
    // Pattern 1: Title contains "Sheet Name - Topic Name Problem #1"
    const match = p.title.match(/.*?-\s*(.*?)\s+Problem\s*#/i);
    if (match && match[1]) {
      topic = match[1]
        .replace(/.*?-\s*/, '') // Clean prefix if any
        .replace(/\s*\(\d+\s*Problems\)/i, '')
        .trim();
    } else if (p.topic_tags && p.topic_tags.length > 0 && p.topic_tags[0] !== 'General') {
      topic = p.topic_tags[0].replace(/\s*\(\d+\s*Problems\)/i, '').trim();
    }
    
    // Clean up any weird prefixes like "31 Sheet - "
    topic = topic.replace(/^[0-9A-Za-z\s]+-\s*/, '').trim();
    if (!topic) topic = 'General';
    
    p.topic_tags = [topic];
    
    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }
    topicMap.get(topic).push(p);
  });
  
  // Rebuild steps array for this sheet
  sheet.steps = Array.from(topicMap.entries()).map(([topicName, probs]) => {
     // Ensure problem objects inside steps have topic_tags updated
     probs.forEach(pr => pr.topic_tags = [topicName]);
     return {
       step_name: topicName,
       problems: probs
     };
  });
  
  console.log(`✅ ${sheet.sheet_name}: Split into ${sheet.steps.length} categories (${sheet.steps.map(s => s.step_name).join(', ')})`);
});

fs.writeFileSync(SHEETS_PATH, JSON.stringify(sheets, null, 2));
console.log("Successfully saved updated steps to sheets_data.json!");
