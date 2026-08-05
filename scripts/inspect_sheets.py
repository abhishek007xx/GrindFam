import urllib.request
import json
import re

url = "https://raw.githubusercontent.com/iamkartikeyan/GrindFam/main/frontend/src/data/sheetsCatalog.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req).read().decode('utf-8')

pattern = r'export\s+const\s+sheetsCatalog\s*=\s*'
cleaned = re.sub(pattern, '', raw).strip()
if cleaned.endswith(';'):
    cleaned = cleaned[:-1].strip()
catalog = json.loads(cleaned)

print("--- SHEET CATALOG PROBLEM COUNTS ---")
for s in catalog:
    total_q = 0
    steps_count = len(s.get('steps', []))
    for step in s.get('steps', []):
        for sub in step.get('subtopics', []):
            total_q += len(sub.get('problems', []))
    print(f"[{s.get('id')}] {s.get('title')} ({s.get('author')}) -> {steps_count} steps, {total_q} problems")
