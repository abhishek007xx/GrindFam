import json
import os
import csv
import re

def process_companies():
    root_dir = r"c:\Users\mrabh\OneDrive\Documents\JamesBond's Tracker"
    json_paths = [
        os.path.join(root_dir, "src", "data", "companies_data.json"),
        os.path.join(root_dir, "frontend", "src", "data", "companies_data.json")
    ]
    csv_out_path = os.path.join(root_dir, "company_wise_dsa_questions.csv")

    with open(json_paths[0], "r", encoding="utf-8") as f:
        companies_data = json.load(f)

    csv_rows = []
    total_problems = 0

    for c_idx, comp in enumerate(companies_data):
        comp_name = comp.get("company_name") or comp.get("companyName") or f"Company {c_idx+1}"
        comp_slug = comp.get("slug") or re.sub(r'[^a-zA-Z0-9\s-]', '', comp_name).lower().replace(' ', '-')
        
        # Original roles or problems
        existing_roles = comp.get("roles") or []
        
        # Flatten all problems for this company
        all_comp_probs = []
        for r in existing_roles:
            all_comp_probs.extend(r.get("problems") or [])

        # Deduplicate raw problems by title/slug
        seen_titles = set()
        dedup_probs = []
        for p in all_comp_probs:
            t = p.get("title") or "Problem"
            if t not in seen_titles:
                seen_titles.add(t)
                dedup_probs.append(p)

        # Categorize problems into Intern, SDE-1, and SDE-2
        easy_probs = [p for p in dedup_probs if p.get("difficulty") == "Easy"]
        medium_probs = [p for p in dedup_probs if p.get("difficulty") == "Medium"]
        hard_probs = [p for p in dedup_probs if p.get("difficulty") == "Hard"]

        # 1. SDE Intern / Entry Level Track
        intern_probs = (easy_probs + medium_probs[:max(5, len(medium_probs)//2)]) or dedup_probs[:15]
        # 2. SDE-1 & High Frequency Track
        sde1_probs = dedup_probs
        # 3. SDE-2 / Senior Track
        sde2_probs = (medium_probs + hard_probs) or dedup_probs[10:]

        new_roles = [
            {
                "role_name": "SDE Intern / Entry Level Track",
                "level": "Intern / Entry Level",
                "guidelines": {
                    "interview_format": [
                        "Round 1: Online Coding Assessment (Speed & Accuracy)",
                        "Round 2: Technical Interview (Core Data Structures & Complexity)",
                        "Round 3: Behavioral & Culture Alignment"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Strings": "35%",
                        "Two Pointers & Sliding Window": "25%",
                        "Hashing & Recursion": "25%",
                        "Basic Trees": "15%"
                    },
                    "behavioral_focus": f"Demonstrate passion for learning, problem solving velocity, and alignment with {comp_name} engineering standards.",
                    "common_rejection_reasons": [
                        "Failing to analyze time & space complexity",
                        "Missing edge cases (empty arrays, negative numbers, boundary conditions)",
                        "Poor communication of thought process during coding"
                    ]
                },
                "problems": intern_probs
            },
            {
                "role_name": "SDE-1 & High Frequency Track",
                "level": "SDE-1",
                "guidelines": {
                    "interview_format": [
                        "Round 1: Online Assessment (Coding & Speed)",
                        "Round 2: Technical DSA Round 1 (Data Structures)",
                        "Round 3: Technical DSA Round 2 (Advanced Algorithms)",
                        "Round 4: Behavioral & Culture Fit"
                    ],
                    "key_topics_weightage": {
                        "Graphs & Trees": "30%",
                        "Dynamic Programming": "25%",
                        "Arrays & Two Pointers": "25%",
                        "Heap & Monotonic Stack": "20%"
                    },
                    "behavioral_focus": f"Demonstrate ownership, clean modular code, and architectural judgment for {comp_name}.",
                    "common_rejection_reasons": [
                        "Starting code implementation before verifying edge cases",
                        "Unoptimized time or space complexity",
                        "Lack of modular function decomposition"
                    ]
                },
                "problems": sde1_probs
            },
            {
                "role_name": "SDE-2 / Senior Track",
                "level": "SDE-2 / Senior",
                "guidelines": {
                    "interview_format": [
                        "Round 1: Technical Coding & Algorithm Optimization",
                        "Round 2: System Design (Low Level & High Level)",
                        "Round 3: Architecture & Deep Tech Round",
                        "Round 4: Leadership & Behavioral"
                    ],
                    "key_topics_weightage": {
                        "Advanced Dynamic Programming": "35%",
                        "Complex Graph Algorithms & Dijkstra": "30%",
                        "System Design & Tradeoffs": "20%",
                        "Trie & Segment Trees": "15%"
                    },
                    "behavioral_focus": f"Demonstrate technical leadership, scalability considerations, and mentorship qualities for {comp_name}.",
                    "common_rejection_reasons": [
                        "Inability to scale algorithmic solutions",
                        "Weak tradeoffs analysis in system design",
                        "Poor leadership / behavioral responses"
                    ]
                },
                "problems": sde2_probs
            }
        ]

        # Ensure guaranteed unique leetcode_slug for every problem in every role
        for r_idx, role in enumerate(new_roles):
            role_level = role["level"]
            seen_slugs = set()
            
            for p_idx, p in enumerate(role["problems"]):
                t = p.get("title") or f"Problem {p_idx+1}"
                raw_slug = p.get("leetcode_slug") or p.get("slug") or ""
                
                clean_title_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', t).lower().strip().replace(' ', '-')
                clean_title_slug = re.sub(r'-+', '-', clean_title_slug)

                if len(clean_title_slug) > 2:
                    base_slug = clean_title_slug
                elif len(raw_slug) > 2:
                    base_slug = raw_slug
                else:
                    base_slug = f"prob-{p_idx+1}"

                # Disambiguate slug per company & role level
                final_slug = base_slug
                if final_slug in seen_slugs:
                    final_slug = f"{base_slug}-{r_idx+1}-{p_idx+1}"
                seen_slugs.add(final_slug)

                p["leetcode_slug"] = final_slug
                p["leetcode_url"] = f"https://leetcode.com/problems/{final_slug}/"
                if not p.get("youtube_tutorial_url"):
                    p["youtube_tutorial_url"] = "https://youtu.be/EAR7De6Goz4"

                diff = p.get("difficulty") or "Medium"
                freq = p.get("frequency_score") or 8
                yt_url = p.get("youtube_tutorial_url")
                tags_list = p.get("topic_tags") or []
                tags_str = ", ".join([str(t) for t in tags_list])

                csv_rows.append({
                    "Company Name": comp_name,
                    "Role Level": role_level,
                    "Problem Title": t,
                    "Difficulty": diff,
                    "Frequency Score": freq,
                    "LeetCode URL": p["leetcode_url"],
                    "YouTube Tutorial URL": yt_url,
                    "Topic Tags": tags_str
                })
                total_problems += 1

        comp["roles"] = new_roles
        print(f"Company: {comp_name:30s} | Unique Roles: {len(new_roles)} | SDE-1 Problems: {len(sde1_probs):4d}")

    # Write updated JSONs to both paths
    for p_path in json_paths:
        with open(p_path, "w", encoding="utf-8") as f:
            json.dump(companies_data, f, indent=2)
        print(f"Saved updated JSON to {p_path}")

    # Write CSV
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

    print(f"\nSuccessfully processed {len(companies_data)} companies and exported {total_problems} problems to company_wise_dsa_questions.csv!")

if __name__ == "__main__":
    process_companies()
