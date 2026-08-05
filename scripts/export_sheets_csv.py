import json
import os
import csv
import re

def export_sheets_to_csv():
    root_dir = r"c:\Users\mrabh\OneDrive\Documents\JamesBond's Tracker"
    sheets_json_path = os.path.join(root_dir, "src", "data", "sheets_data.json")
    csv_out_path = os.path.join(root_dir, "famous_dsa_sheets_questions.csv")

    print(f"--- Reading sheets from {sheets_json_path} ---")
    with open(sheets_json_path, "r", encoding="utf-8") as f:
        sheets_data = json.load(f)

    rows = []
    total_problems = 0

    for sheet in sheets_data:
        sheet_name = sheet.get("sheet_name") or sheet.get("name") or "DSA Sheet"
        creator_name = sheet.get("creator_name") or sheet.get("creator") or "Community Curator"
        steps = sheet.get("steps") or []

        for step in steps:
            step_name = step.get("step_name") or step.get("name") or "General Problems"
            problems = step.get("problems") or []

            for p in problems:
                title = p.get("title") or "Problem"
                slug = p.get("leetcode_slug") or p.get("slug") or re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower().replace(' ', '-')
                difficulty = p.get("difficulty") or "Medium"
                
                leetcode_url = p.get("leetcode_url") or f"https://leetcode.com/problems/{slug}/"
                yt_url = p.get("youtube_tutorial_url") or p.get("video_url") or "https://youtu.be/EAR7De6Goz4"
                
                tags_list = p.get("topic_tags") or []
                if isinstance(tags_list, list):
                    tags_str = ", ".join([t for t in tags_list if isinstance(t, str)])
                else:
                    tags_str = str(tags_list)

                rows.append({
                    "Sheet Name": sheet_name,
                    "Creator Name": creator_name,
                    "Step / Category": step_name,
                    "Problem Title": title,
                    "Difficulty": difficulty,
                    "LeetCode URL": leetcode_url,
                    "YouTube Tutorial URL": yt_url,
                    "Topic Tags": tags_str
                })
                total_problems += 1

    fieldnames = [
        "Sheet Name",
        "Creator Name",
        "Step / Category",
        "Problem Title",
        "Difficulty",
        "LeetCode URL",
        "YouTube Tutorial URL",
        "Topic Tags"
    ]

    print(f"--- Writing {len(rows)} rows to {csv_out_path} ---")
    with open(csv_out_path, "w", encoding="utf-8", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully exported {total_problems} problems across {len(sheets_data)} famous DSA sheets to famous_dsa_sheets_questions.csv!")

if __name__ == "__main__":
    export_sheets_to_csv()
