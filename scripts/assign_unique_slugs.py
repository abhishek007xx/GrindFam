import json
import os
import csv
import re

def assign_unique_slugs_and_export():
    root_dir = r"c:\Users\mrabh\OneDrive\Documents\JamesBond's Tracker"
    json_paths = [
        os.path.join(root_dir, "src", "data", "sheets_data.json"),
        os.path.join(root_dir, "frontend", "src", "data", "sheets_data.json")
    ]
    csv_out_path = os.path.join(root_dir, "famous_dsa_sheets_questions.csv")

    with open(json_paths[0], "r", encoding="utf-8") as f:
        sheets_data = json.load(f)

    csv_rows = []
    total_processed = 0

    for sheet in sheets_data:
        sheet_name = sheet.get("sheet_name") or sheet.get("name") or "DSA Sheet"
        creator_name = sheet.get("creator_name") or sheet.get("creator") or "Community Curator"
        sheet_slug = sheet.get("slug") or re.sub(r'[^a-zA-Z0-9\s-]', '', sheet_name).lower().replace(' ', '-')
        steps = sheet.get("steps") or []

        seen_sheet_slugs = set()
        sheet_problem_count = 0

        for s_idx, step in enumerate(steps):
            step_name = step.get("step_name") or step.get("name") or "General Problems"
            problems = step.get("problems") or []

            for p_idx, p in enumerate(problems):
                title = p.get("title") or f"Problem {p_idx+1}"
                raw_slug = p.get("leetcode_slug") or p.get("slug") or ""
                
                # Derive clean title slug
                clean_title_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower().strip().replace(' ', '-')
                clean_title_slug = re.sub(r'-+', '-', clean_title_slug)

                # Determine base slug
                if len(clean_title_slug) > 2:
                    base_slug = clean_title_slug
                elif len(raw_slug) > 2:
                    base_slug = raw_slug
                else:
                    base_slug = f"prob-{p_idx+1}"

                # Ensure uniqueness within this sheet
                final_slug = base_slug
                if final_slug in seen_sheet_slugs:
                    final_slug = f"{base_slug}-{s_idx+1}-{p_idx+1}"

                seen_sheet_slugs.add(final_slug)

                # Update problem object
                p["leetcode_slug"] = final_slug
                p["leetcode_url"] = f"https://leetcode.com/problems/{final_slug}/"
                if not p.get("youtube_tutorial_url"):
                    p["youtube_tutorial_url"] = "https://youtu.be/EAR7De6Goz4"

                difficulty = p.get("difficulty") or "Medium"
                yt_url = p.get("youtube_tutorial_url")
                tags_list = p.get("topic_tags") or []
                tags_str = ", ".join([t for t in tags_list if isinstance(t, str)]) if isinstance(tags_list, list) else str(tags_list)

                csv_rows.append({
                    "Sheet Name": sheet_name,
                    "Creator Name": creator_name,
                    "Step / Category": step_name,
                    "Problem Title": title,
                    "Difficulty": difficulty,
                    "LeetCode URL": p["leetcode_url"],
                    "YouTube Tutorial URL": yt_url,
                    "Topic Tags": tags_str
                })
                sheet_problem_count += 1
                total_processed += 1

        sheet["total_problems_count"] = sheet_problem_count
        print(f"Sheet: {sheet_name:40s} | Total Problems: {sheet_problem_count:4d}")

    # Write updated JSONs to both paths
    for p_path in json_paths:
        with open(p_path, "w", encoding="utf-8") as f:
            json.dump(sheets_data, f, indent=2)
        print(f"Saved updated JSON to {p_path}")

    # Write CSV
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
    with open(csv_out_path, "w", encoding="utf-8", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)

    print(f"\nSuccessfully assigned unique slugs and exported {total_processed} problems to famous_dsa_sheets_questions.csv!")

if __name__ == "__main__":
    assign_unique_slugs_and_export()
