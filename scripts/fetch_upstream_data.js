const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
};

async function fetchUpstreamData() {
  console.log("Fetching companyCatalog.js...");
  const companyData = await downloadFile('https://raw.githubusercontent.com/iamkartikeyan/GrindFam/main/frontend/src/data/companyCatalog.js');
  
  console.log("Fetching sheetsCatalog.js...");
  const sheetsData = await downloadFile('https://raw.githubusercontent.com/iamkartikeyan/GrindFam/main/frontend/src/data/sheetsCatalog.js');
  
  console.log("Fetching striverA2ZSheet.js...");
  const striverData = await downloadFile('https://raw.githubusercontent.com/iamkartikeyan/GrindFam/main/frontend/src/data/striverA2ZSheet.js');

  // We need to parse these JS files. They look like: `export const companyCatalog = [...]`
  // We can write them to a temp file, load them as CommonJS by stripping the "export const ", and write out JSON.
  
  const processJs = (jsCode, varName) => {
    // Replace "export const varName =" with "module.exports ="
    const cjs = jsCode.replace(`export const ${varName} =`, 'module.exports =');
    const tmpPath = path.join(__dirname, `${varName}_tmp.js`);
    fs.writeFileSync(tmpPath, cjs);
    const data = require(tmpPath);
    fs.unlinkSync(tmpPath);
    return data;
  };

  const companies = processJs(companyData, 'companyCatalog');
  let sheets = processJs(sheetsData, 'sheetsCatalog');
  const striver = processJs(striverData, 'striverA2ZSheet');
  
  // striverA2ZSheet was separated out in the new repo. We should merge it back into sheets.
  sheets = [striver, ...sheets];

  // The local codebase at cc3c1a4 expects slightly different keys based on my previous seeding script, 
  // but let's check what src/data/companies_data.json actually expects.
  // Wait, let's just write them as-is and we can adapt if needed, or if the frontend expects `company_name` vs `companyName`.

  const companiesDest = path.join(__dirname, '..', 'src', 'data', 'companies_data.json');
  const sheetsDest = path.join(__dirname, '..', 'src', 'data', 'sheets_data.json');
  
  fs.writeFileSync(companiesDest, JSON.stringify(companies, null, 2));
  fs.writeFileSync(sheetsDest, JSON.stringify(sheets, null, 2));

  // Also copy to frontend
  const feCompaniesDest = path.join(__dirname, '..', 'frontend', 'src', 'data', 'companies_data.json');
  const feSheetsDest = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets_data.json');
  
  if (fs.existsSync(path.dirname(feCompaniesDest))) {
      fs.writeFileSync(feCompaniesDest, JSON.stringify(companies, null, 2));
      fs.writeFileSync(feSheetsDest, JSON.stringify(sheets, null, 2));
  }

  console.log("Data extracted and saved successfully!");
  console.log(`Companies: ${companies.length}`);
  console.log(`Sheets: ${sheets.length}`);
}

fetchUpstreamData().catch(console.error);
