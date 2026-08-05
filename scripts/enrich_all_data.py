import urllib.request
import json
import re
import os

def fetch_raw(file_path):
    url = f"https://raw.githubusercontent.com/iamkartikeyan/GrindFam/main/{file_path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req).read().decode('utf-8')

print("1. Fetching raw catalogs from iamkartikeyan/GrindFam...")

sheets_catalog_js = fetch_raw("frontend/src/data/sheetsCatalog.js")
company_catalog_js = fetch_raw("frontend/src/data/companyCatalog.js")
striver_raw = fetch_raw("striver_questions.json")

striver_questions = json.loads(striver_raw)

def parse_js_export(js_content, export_name):
    pattern = rf"export\s+const\s+{export_name}\s*=\s*"
    cleaned = re.sub(pattern, "", js_content).strip()
    if cleaned.endswith(";"):
        cleaned = cleaned[:-1].strip()
    return json.loads(cleaned)

sheets_catalog = parse_js_export(sheets_catalog_js, "sheetsCatalog")
company_catalog = parse_js_export(company_catalog_js, "companyCatalog")

# Define Popularity Rankings
SHEET_POPULARITY_ORDER = [
    "strivers-a2z",
    "striver-sde",
    "love-babbar",
    "neetcode-150",
    "blind-75",
    "shradha-aman-dsa",
    "code-army",
    "top-interview-150",
    "striver-79",
    "neetcode-250",
    "fraz-dsa",
    "arsh-dsa",
    "algomaster-300",
    "nishant-151",
    "cses-problem-set",
    "dp-mastery",
    "graph-mastery",
    "string-mastery",
    "binary-search-mastery",
    "heap-mastery",
    "leetcode-top-100",
    "kushal-vijay-20-patterns",
    "algomaster-150",
    "algomaster-75",
    "cp31-800",
    "cp31-900",
    "cp31-1000",
    "cp31-1100",
    "cp31-1200",
    "cp31-1300",
    "a2oj-800-1299",
    "atharva-150",
    "manasi-70"
]

COMPANY_POPULARITY_ORDER = [
    "google", "amazon", "microsoft", "meta", "facebook", "apple", "uber", "netflix",
    "goldmansachs", "goldman-sachs", "swiggy", "zomato", "flipkart", "razorpay",
    "phonepe", "cred", "meesho", "dream11", "zerodha", "freshworks", "zoho",
    "adobe", "atlassian", "morganstanley", "morgan-stanley", "oracle", "salesforce",
    "nvidia", "servicenow", "intuit", "deshaw", "de-shaw", "jpmorgan", "jp-morgan",
    "walmart", "paytm", "groww", "linkedin", "airbnb", "spotify", "stripe", "bytedance",
    "coinbase", "databricks", "snowflake", "palantir", "citadel", "bloomberg"
]

def get_sheet_rank(slug):
    try:
        return SHEET_POPULARITY_ORDER.index(slug)
    except ValueError:
        return 999

def get_company_rank(slug):
    slug_lower = slug.lower()
    for idx, key in enumerate(COMPANY_POPULARITY_ORDER):
        if key in slug_lower:
            return idx
    return 999

# 1. Format sheets_data.json
formatted_sheets = []

for sheet in sheets_catalog:
    sheet_name = sheet.get("title", "")
    creator_name = sheet.get("author", "")
    slug = sheet.get("id", "")
    rank = get_sheet_rank(slug)
    
    # We group problems by subtopics (or steps if subtopics are empty)
    step_groups = {}
    total_problems_count = 0

    for step in sheet.get("steps", []):
        step_title = step.get("title", "")
        
        # Check subtopics
        subtopics = step.get("subtopics", [])
        if subtopics:
            for subtopic in subtopics:
                sub_title = subtopic.get("title") or step_title
                if sub_title not in step_groups:
                    step_groups[sub_title] = []

                for p in subtopic.get("problems", []):
                    title = p.get("title", "")
                    leetcode_url = p.get("leetcodeUrl") or p.get("url") or f"https://leetcode.com/problems/{p.get('titleSlug', '')}/"
                    slug_match = re.search(r"leetcode\.com/problems/([^/]+)", leetcode_url)
                    leetcode_slug = slug_match.group(1) if slug_match else p.get("titleSlug", "")

                    video_url = p.get("videoUrl") or p.get("youtube_tutorial_url") or ""
                    if not video_url or "youtu" not in video_url:
                        video_url = f"https://www.youtube.com/results?search_query={creator_name}+{title}"

                    difficulty = p.get("difficulty", "Medium")

                    topic_tags = p.get("topicTags") or [step_title, sub_title]
                    if isinstance(topic_tags, list) and len(topic_tags) > 0 and isinstance(topic_tags[0], dict):
                        topic_tags = [t.get("name", "") for t in topic_tags if t.get("name")]

                    step_groups[sub_title].append({
                        "title": title,
                        "leetcode_url": leetcode_url,
                        "leetcode_slug": leetcode_slug,
                        "difficulty": difficulty,
                        "youtube_tutorial_url": video_url,
                        "topic_tags": topic_tags,
                        "step_name": sub_title
                    })
                    total_problems_count += 1
        else:
            # Fallback directly to step
            if step_title not in step_groups:
                step_groups[step_title] = []

            for p in step.get("problems", []):
                title = p.get("title", "")
                leetcode_url = p.get("leetcodeUrl") or p.get("url") or f"https://leetcode.com/problems/{p.get('titleSlug', '')}/"
                slug_match = re.search(r"leetcode\.com/problems/([^/]+)", leetcode_url)
                leetcode_slug = slug_match.group(1) if slug_match else p.get("titleSlug", "")

                video_url = p.get("videoUrl") or p.get("youtube_tutorial_url") or ""
                if not video_url or "youtu" not in video_url:
                    video_url = f"https://www.youtube.com/results?search_query={creator_name}+{title}"

                difficulty = p.get("difficulty", "Medium")
                topic_tags = p.get("topicTags") or [step_title]
                if isinstance(topic_tags, list) and len(topic_tags) > 0 and isinstance(topic_tags[0], dict):
                    topic_tags = [t.get("name", "") for t in topic_tags if t.get("name")]

                step_groups[step_title].append({
                    "title": title,
                    "leetcode_url": leetcode_url,
                    "leetcode_slug": leetcode_slug,
                    "difficulty": difficulty,
                    "youtube_tutorial_url": video_url,
                    "topic_tags": topic_tags,
                    "step_name": step_title
                })
                total_problems_count += 1

    formatted_steps = []
    for g_title, p_list in step_groups.items():
        formatted_steps.append({
            "step_name": g_title,
            "problems": p_list
        })

    formatted_sheets.append({
        "sheet_name": sheet_name,
        "creator_name": creator_name,
        "slug": slug,
        "popularity_rank": rank,
        "total_problems_count": total_problems_count,
        "steps": formatted_steps
    })

# Special handling for Striver's A2Z Sheet if striver_questions.json is richer
striver_sheet_entry = next((s for s in formatted_sheets if s['slug'] == 'strivers-a2z'), None)
if striver_sheet_entry and len(striver_questions) >= 400:
    striver_step_map = {}
    total_striver_count = 0

    for q in striver_questions:
        st = q.get("step", "General Step")
        sub = q.get("subtopic", "")
        group_key = f"{st} - {sub}" if sub else st

        if group_key not in striver_step_map:
            striver_step_map[group_key] = []

        t_slug = q.get("titleSlug", "")
        lc_url = f"https://leetcode.com/problems/{t_slug}/" if t_slug else "https://leetcode.com/"

        striver_step_map[group_key].append({
            "title": q.get("title") or q.get("cleanTitle", "Problem"),
            "leetcode_url": lc_url,
            "leetcode_slug": t_slug,
            "difficulty": q.get("difficulty", "Medium"),
            "youtube_tutorial_url": q.get("videoUrl") or f"https://www.youtube.com/results?search_query=Striver+{q.get('cleanTitle')}",
            "topic_tags": [t.get("name") if isinstance(t, dict) else t for t in q.get("topicTags", [])],
            "step_name": group_key
        })
        total_striver_count += 1

    striver_steps_list = []
    for g_title, p_list in striver_step_map.items():
        striver_steps_list.append({
            "step_name": g_title,
            "problems": p_list
        })

    striver_sheet_entry['steps'] = striver_steps_list
    striver_sheet_entry['total_problems_count'] = total_striver_count

# Sort Sheets by Popularity Rank
formatted_sheets.sort(key=lambda s: s['popularity_rank'])

# 2. Format companies_data.json
formatted_companies = []

for comp in company_catalog:
    comp_name = comp.get("companyName") or comp.get("title", "").replace(" Interview Kit", "")
    slug = comp.get("id", "").replace("company-", "")
    logo_url = comp.get("logo", "")
    rank = get_company_rank(slug)

    roles = []
    for step in comp.get("steps", []):
        role_name = step.get("title", "SDE Candidate")
        level = "All Levels"
        
        role_problems = []
        subtopics = step.get("subtopics", [])
        if subtopics:
            for subtopic in subtopics:
                subtopic_title = subtopic.get("title", "")
                for p in subtopic.get("problems", []):
                    title = p.get("title", "")
                    leetcode_url = p.get("leetcodeUrl") or p.get("url") or f"https://leetcode.com/problems/{p.get('titleSlug', '')}/"
                    slug_match = re.search(r"leetcode\.com/problems/([^/]+)", leetcode_url)
                    leetcode_slug = slug_match.group(1) if slug_match else p.get("titleSlug", "")

                    difficulty = p.get("difficulty", "Medium")
                    frequency_score = p.get("frequencyScore", 8)
                    video_url = p.get("videoUrl") or f"https://www.youtube.com/results?search_query={comp_name}+{title}"

                    role_problems.append({
                        "title": title,
                        "leetcode_slug": leetcode_slug,
                        "leetcode_url": leetcode_url,
                        "difficulty": difficulty,
                        "frequency_score": frequency_score,
                        "youtube_tutorial_url": video_url,
                        "topic_tags": [subtopic_title]
                    })
        else:
            for p in step.get("problems", []):
                title = p.get("title", "")
                leetcode_url = p.get("leetcodeUrl") or p.get("url") or f"https://leetcode.com/problems/{p.get('titleSlug', '')}/"
                slug_match = re.search(r"leetcode\.com/problems/([^/]+)", leetcode_url)
                leetcode_slug = slug_match.group(1) if slug_match else p.get("titleSlug", "")

                difficulty = p.get("difficulty", "Medium")
                frequency_score = p.get("frequencyScore", 8)
                video_url = p.get("videoUrl") or f"https://www.youtube.com/results?search_query={comp_name}+{title}"

                role_problems.append({
                    "title": title,
                    "leetcode_slug": leetcode_slug,
                    "leetcode_url": leetcode_url,
                    "difficulty": difficulty,
                    "frequency_score": frequency_score,
                    "youtube_tutorial_url": video_url,
                    "topic_tags": [role_name]
                })

        roles.append({
            "role_name": role_name,
            "level": level,
            "guidelines": {
                "interview_format": [
                  "Round 1: Online Assessment (Coding & Algorithmic Speed)",
                  "Round 2: Technical Interview (DSA & Deep Problem Solving)",
                  "Round 3: System Design & Low Level Architecture",
                  "Round 4: Leadership Principles, Culture Fit & Behavioral"
                ],
                "key_topics_weightage": {
                  "Trees & Graphs": "30%",
                  "Arrays & Hashing": "25%",
                  "Dynamic Programming": "20%",
                  "System Design": "15%",
                  "Behavioral": "10%"
                },
                "behavioral_focus": f"Demonstrate high coding velocity, rigorous edge case handling, and customer obsession aligned with {comp_name} core values.",
                "common_rejection_reasons": [
                  "Jumping straight to code without discussing time/space complexity",
                  "Failing to handle boundary conditions or null pointer checks",
                  "Poor verbal communication during problem breakdown"
                ]
            },
            "problems": role_problems
        })

    formatted_companies.append({
        "company_name": comp_name,
        "slug": slug,
        "logo_url": logo_url,
        "popularity_rank": rank,
        "roles": roles
    })

# Sort Companies by Popularity Rank
formatted_companies.sort(key=lambda c: c['popularity_rank'])

print("\n--- POPULARITY RANKED SHEETS ---")
for s in formatted_sheets[:15]:
    print(f" Rank {s['popularity_rank']}: {s['sheet_name']} ({s['creator_name']}) - {s['total_problems_count']} problems in {len(s['steps'])} categories")

print("\n--- POPULARITY RANKED COMPANIES ---")
for c in formatted_companies[:15]:
    total_p = sum(len(r['problems']) for r in c['roles'])
    print(f" Rank {c['popularity_rank']}: {c['company_name']} - {total_p} problems")

# Save outputs
os.makedirs("frontend/src/data", exist_ok=True)

with open("frontend/src/data/sheets_data.json", "w", encoding="utf-8") as f:
    json.dump(formatted_sheets, f, indent=2)

with open("frontend/src/data/companies_data.json", "w", encoding="utf-8") as f:
    json.dump(formatted_companies, f, indent=2)

print("\nSUCCESS: All data formatted, subtopic-categorized, and ranked by popularity!")
