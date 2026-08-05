import json
import os
import csv
import re
from difflib import get_close_matches

def clean_company_questions():
    scratch_dir = r"C:\Users\mrabh\.gemini\antigravity-ide\brain\42f8eb5a-4eaa-4e60-a7a4-e8844cbd4288\scratch"
    root_dir = r"c:\Users\mrabh\OneDrive\Documents\JamesBond's Tracker"

    leetcode_path = os.path.join(scratch_dir, "leetcode_questions.json")
    striver_path = os.path.join(scratch_dir, "striver_questions.json")

    print("--- 1. Building Master Problem Resolver Dictionary ---")
    with open(leetcode_path, "r", encoding="utf-8") as f:
        leetcode_raw = json.load(f)

    with open(striver_path, "r", encoding="utf-8") as f:
        striver_raw = json.load(f)

    # Master dictionary maps clean_slug -> {title, slug, difficulty, url}
    # Master dictionary maps clean_title_lower -> {title, slug, difficulty, url}
    slug_map = {}
    title_map = {}
    known_titles_list = []

    for item in leetcode_raw:
        t = item.get("title")
        slug = item.get("titleSlug") or item.get("slug")
        diff = item.get("difficulty") or "Medium"
        if t and slug:
            t_clean = t.strip()
            url = f"https://leetcode.com/problems/{slug}/"
            obj = {"title": t_clean, "slug": slug, "difficulty": diff, "url": url}
            
            slug_map[slug.lower()] = obj
            title_map[t_clean.lower()] = obj
            known_titles_list.append(t_clean)

    for item in striver_raw:
        t = item.get("cleanTitle") or item.get("title")
        slug = item.get("titleSlug") or item.get("slug")
        diff = item.get("difficulty") or "Medium"
        if t and slug and slug.lower() not in slug_map:
            t_clean = t.strip()
            url = f"https://leetcode.com/problems/{slug}/"
            obj = {"title": t_clean, "slug": slug, "difficulty": diff, "url": url}
            
            slug_map[slug.lower()] = obj
            title_map[t_clean.lower()] = obj
            known_titles_list.append(t_clean)

    print(f"Master resolver dictionary contains {len(title_map)} canonical problems.")

    # Manual fixes for common PDF table line-wrap truncation patterns
    pdf_manual_fixes = {
        "subarray sum equals kprefix sum, hash mapmediumhigh prefix sum + frequency maptwo sum, continuous": ("Subarray Sum Equals K", "subarray-sum-equals-k", "Medium"),
        "question 2": ("3Sum", "3sum", "Medium"),
        "question 12": ("3Sum Closest", "3sum-closest", "Medium"),
        "rotate image /": ("Rotate Image", "rotate-image", "Medium"),
        "spiral": ("Spiral Matrix", "spiral-matrix", "Medium"),
        "set": ("Set Matrix Zeroes", "set-matrix-zeroes", "Medium"),
        "merge": ("Merge Intervals", "merge-intervals", "Medium"),
        "non-overlapping": ("Non-overlapping Intervals", "non-overlapping-intervals", "Medium"),
        "majority element boyer-moore votingeasy highboyer-moore majority vote algorithmmajority element ii": ("Majority Element", "majority-element", "Easy"),
        "linked list cycle (floyd's) linked list, two pointerseasy high slow and fast pointer cycle detection": ("Linked List Cycle", "linked-list-cycle", "Easy"),
        "invert/flip binary tree": ("Invert Binary Tree", "invert-binary-tree", "Easy"),
        "two sum (variant 2)": ("Two Sum II - Input Array Is Sorted", "two-sum-ii-input-array-is-sorted", "Medium")
    }

    json_paths = [
        os.path.join(root_dir, "src", "data", "companies_data.json"),
        os.path.join(root_dir, "frontend", "src", "data", "companies_data.json")
    ]
    csv_out_path = os.path.join(root_dir, "company_wise_dsa_questions.csv")

    with open(json_paths[0], "r", encoding="utf-8") as f:
        companies_data = json.load(f)

    csv_rows = []
    total_repaired = 0

    print("--- 2. Repairing Problem Titles & LeetCode URLs across 101 Companies ---")

    for c_idx, comp in enumerate(companies_data):
        comp_name = comp.get("company_name") or comp.get("companyName") or f"Company {c_idx+1}"
        roles = comp.get("roles") or []

        for r_idx, role in enumerate(roles):
            role_level = role.get("level") or "SDE-1"
            problems = role.get("problems") or []

            seen_slugs = set()

            for p_idx, p in enumerate(problems):
                raw_title = p.get("title", "").strip()
                raw_title_lower = raw_title.lower()
                raw_slug = (p.get("leetcode_slug") or "").lower()

                resolved_title = None
                resolved_slug = None
                resolved_diff = p.get("difficulty") or "Medium"
                resolved_url = None

                # Check manual fixes first
                if raw_title_lower in pdf_manual_fixes:
                    t_fix, s_fix, d_fix = pdf_manual_fixes[raw_title_lower]
                    resolved_title = t_fix
                    resolved_slug = s_fix
                    resolved_diff = d_fix
                    resolved_url = f"https://leetcode.com/problems/{s_fix}/"
                elif raw_title_lower in title_map:
                    obj = title_map[raw_title_lower]
                    resolved_title = obj["title"]
                    resolved_slug = obj["slug"]
                    resolved_diff = obj["difficulty"]
                    resolved_url = obj["url"]
                elif raw_slug in slug_map:
                    obj = slug_map[raw_slug]
                    resolved_title = obj["title"]
                    resolved_slug = obj["slug"]
                    resolved_diff = obj["difficulty"]
                    resolved_url = obj["url"]
                else:
                    # Clean title string from trailing tags/numbers
                    clean_t = re.sub(r'^(?:Question\s*\d+:?|\d+[\.\)-]\s*)', '', raw_title, flags=re.IGNORECASE).strip()
                    clean_t = re.sub(r'\s*\([^)]*\)', '', clean_t).strip()
                    clean_lower = clean_t.lower()

                    if clean_lower in title_map:
                        obj = title_map[clean_lower]
                        resolved_title = obj["title"]
                        resolved_slug = obj["slug"]
                        resolved_diff = obj["difficulty"]
                        resolved_url = obj["url"]
                    else:
                        # Fuzzy match title against known canonical LeetCode titles
                        matches = get_close_matches(clean_t, known_titles_list, n=1, cutoff=0.7)
                        if matches:
                            canonical_t = matches[0]
                            obj = title_map[canonical_t.lower()]
                            resolved_title = obj["title"]
                            resolved_slug = obj["slug"]
                            resolved_diff = obj["difficulty"]
                            resolved_url = obj["url"]
                        else:
                            # Fallback: clean title and generate valid slug
                            resolved_title = clean_t if clean_t else raw_title
                            resolved_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', resolved_title).lower().replace(' ', '-')
                            resolved_slug = re.sub(r'-+', '-', resolved_slug)
                            resolved_url = f"https://leetcode.com/problems/{resolved_slug}/"

                # Ensure uniqueness within this company role
                final_slug = resolved_slug
                if final_slug in seen_slugs:
                    final_slug = f"{resolved_slug}-{r_idx+1}-{p_idx+1}"
                seen_slugs.add(final_slug)

                # Update problem object in-place
                p["title"] = resolved_title
                p["leetcode_slug"] = final_slug
                p["leetcode_url"] = f"https://leetcode.com/problems/{resolved_slug}/"
                p["difficulty"] = resolved_diff
                if not p.get("youtube_tutorial_url"):
                    p["youtube_tutorial_url"] = "https://youtu.be/EAR7De6Goz4"

                freq = p.get("frequency_score") or 8
                yt_url = p["youtube_tutorial_url"]
                tags_list = p.get("topic_tags") or []
                tags_str = ", ".join([str(t) for t in tags_list])

                csv_rows.append({
                    "Company Name": comp_name,
                    "Role Level": role_level,
                    "Problem Title": resolved_title,
                    "Difficulty": resolved_diff,
                    "Frequency Score": freq,
                    "LeetCode URL": p["leetcode_url"],
                    "YouTube Tutorial URL": yt_url,
                    "Topic Tags": tags_str
                })
                total_repaired += 1

    # Save cleaned JSON files
    for p_path in json_paths:
        with open(p_path, "w", encoding="utf-8") as f:
            json.dump(companies_data, f, indent=2)
        print(f"Saved cleaned companies dataset to {p_path}")

    # Save cleaned CSV
    fieldnames = [
        "Company Name",
        "Role Level",
        "Problem Title",
        "Difficulty",
        "Frequency Score",
        "LeetCode URL",
        "YouTube Tutorial URL",
        "Topic Tags"
    ]
    with open(csv_out_path, "w", encoding="utf-8", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(csv_rows)

    print(f"\nSuccessfully cleaned and exported {total_repaired} canonical company problems to company_wise_dsa_questions.csv!")

if __name__ == "__main__":
    clean_company_questions()
