import json
import os

def apply_popularity_ranks():
    root_dir = r"c:\Users\mrabh\OneDrive\Documents\JamesBond's Tracker"

    comp_paths = [
        os.path.join(root_dir, "src", "data", "companies_data.json"),
        os.path.join(root_dir, "frontend", "src", "data", "companies_data.json")
    ]

    sheet_paths = [
        os.path.join(root_dir, "src", "data", "sheets_data.json"),
        os.path.join(root_dir, "frontend", "src", "data", "sheets_data.json")
    ]

    # 1. Company Popularity Ranks
    famous_company_order = [
        "google", "amazon", "microsoft", "meta", "facebook", "apple", "netflix", "uber", "adobe",
        "goldman-sachs", "walmart", "flipkart", "swiggy", "zomato", "razorpay", "phonepe",
        "linkedin", "oracle", "paypal", "mastercard", "visa", "intuit", "nvidia", "salesforce",
        "airbnb", "spotify", "atlassian", "databricks", "stripe", "coinbase", "freshworks", "zoho"
    ]

    with open(comp_paths[0], "r", encoding="utf-8") as f:
        companies = json.load(f)

    def get_comp_rank(c):
        slug = (c.get("slug") or "").lower()
        name = (c.get("company_name") or c.get("companyName") or "").lower()
        for idx, key in enumerate(famous_company_order):
            if key in slug or key in name:
                return idx
        return 999

    for c in companies:
        c["popularity_rank"] = get_comp_rank(c)

    companies.sort(key=lambda x: (x["popularity_rank"], x.get("company_name", "")))

    for p in comp_paths:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(companies, f, indent=2)
        print(f"Saved ranked companies dataset to {p}")

    # 2. Creator Sheet Popularity Ranks
    famous_sheet_order = [
        "striver-s-a2z-dsa-course-sheet",
        "strivers-a2z",
        "striver-sde",
        "striver-sde-sheet",
        "love-babbar",
        "neetcode-150",
        "blind-75",
        "apna-college",
        "dsa-by-shradha-didi--aman-bhaiya",
        "code-army",
        "fraz-dsa-sheet",
        "arsh-dsa-sheet",
        "cses-problem-set",
        "algomaster-300",
        "neetcode-250",
        "striver-79"
    ]

    with open(sheet_paths[0], "r", encoding="utf-8") as f:
        sheets = json.load(f)

    def get_sheet_rank(s):
        slug = (s.get("slug") or "").lower()
        name = (s.get("sheet_name") or s.get("name") or "").lower()
        for idx, key in enumerate(famous_sheet_order):
            if key in slug or key in name:
                return idx
        return 999

    for s in sheets:
        s["popularity_rank"] = get_sheet_rank(s)

    sheets.sort(key=lambda x: (x["popularity_rank"], x.get("sheet_name", "")))

    for p in sheet_paths:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(sheets, f, indent=2)
        print(f"Saved ranked sheets dataset to {p}")

    print("\nPopularity Ranks applied successfully!")

if __name__ == "__main__":
    apply_popularity_ranks()
