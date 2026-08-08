import rawCsvData from '../data/comprehensive_role_and_sheet_roadmaps.csv?raw';
import detailedJsonData from '../data/detailed_roadmaps_data.json';

function parseCSV(csvText) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentField.trim());
      if (currentLine.length > 1 || currentLine[0] !== '') {
        lines.push(currentLine);
      }
      currentLine = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.replace(/^"|"$/g, ''));
  const dataRows = lines.slice(1);

  return dataRows.map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ? row[idx].replace(/^"|"$/g, '') : '';
    });
    return obj;
  });
}

const parsedRows = parseCSV(rawCsvData);

// Group rows by Roadmap_ID
const roadmapsMap = new Map();

parsedRows.forEach(row => {
  const rId = row.Roadmap_ID;
  if (!rId) return;

  if (!roadmapsMap.has(rId)) {
    roadmapsMap.set(rId, {
      id: rId,
      category: row.Roadmap_Category,
      title: row.Roadmap_Title,
      creator: row.Creator_or_Source,
      steps: []
    });
  }

  const mapItem = roadmapsMap.get(rId);

  const topics = row.Key_Topics_Covered
    ? row.Key_Topics_Covered.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const problems = row.Recommended_Problems_or_Skills
    ? row.Recommended_Problems_or_Skills.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  mapItem.steps.push({
    stepNumber: parseInt(row.Step_Number, 10) || (mapItem.steps.length + 1),
    title: row.Node_Title,
    subtitle: row.Node_Subtitle_or_Summary,
    description: row.Detailed_Description,
    topics,
    problems,
    icon: row.Icon_Type || 'code',
    color: row.Node_Color_Theme || 'blue',
    sourceUrl: row.Source_URL || 'https://roadmap.sh'
  });
});

// Merge deeply detailed JSON roadmaps — overwrite CSV entries with richer data
if (Array.isArray(detailedJsonData)) {
  detailedJsonData.forEach(item => {
    // Normalize ID: strip 'official-' prefix for backwards compat
    const targetId = item.id;

    roadmapsMap.set(targetId, {
      id: targetId,
      category: item.category,
      title: item.title,
      creator: item.creator,
      description: item.description,
      steps: item.steps
    });
  });
}

// Sort steps by stepNumber for each roadmap
roadmapsMap.forEach(rm => {
  rm.steps.sort((a, b) => a.stepNumber - b.stepNumber);
});

export const ALL_ROADMAPS = Array.from(roadmapsMap.values());

export function getAllRoadmaps() {
  return ALL_ROADMAPS;
}

export function getRoadmapById(id) {
  return ALL_ROADMAPS.find(r => r.id === id) || null;
}
