import os
import re
import json
import csv
import random
import time
import logging
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants & Headers Pool
# ---------------------------------------------------------------------------
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0"
]

TARGET_COMPANIES = [
    # --- Top Global Tech Giants ---
    {
        "company_name": "Amazon",
        "slug": "amazon",
        "krishna_key": "amazon",
        "sean_slug": "amazon",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
        "company_name": "Google",
        "slug": "google",
        "krishna_key": "google",
        "sean_slug": "google",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    },
    {
        "company_name": "Meta",
        "slug": "meta",
        "krishna_key": "facebook",
        "sean_slug": "facebook",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
    },
    {
        "company_name": "Microsoft",
        "slug": "microsoft",
        "krishna_key": "microsoft",
        "sean_slug": "microsoft",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
    },
    {
        "company_name": "Uber",
        "slug": "uber",
        "krishna_key": "uber",
        "sean_slug": "uber",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.svg"
    },
    {
        "company_name": "Apple",
        "slug": "apple",
        "krishna_key": "apple",
        "sean_slug": "apple",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
    },
    # --- Top Placement & High CTC Companies in India ---
    {
        "company_name": "Flipkart",
        "slug": "flipkart",
        "krishna_key": "flipkart",
        "sean_slug": "flipkart",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg"
    },
    {
        "company_name": "Goldman Sachs",
        "slug": "goldman-sachs",
        "krishna_key": "goldman-sachs",
        "sean_slug": "goldman-sachs",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg"
    },
    {
        "company_name": "Adobe",
        "slug": "adobe",
        "krishna_key": "adobe",
        "sean_slug": "adobe",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_2017.svg"
    },
    {
        "company_name": "Oracle",
        "slug": "oracle",
        "krishna_key": "oracle",
        "sean_slug": "oracle",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg"
    },
    {
        "company_name": "Walmart Global Tech",
        "slug": "walmart",
        "krishna_key": "walmart",
        "sean_slug": "walmart-labs",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg"
    },
    {
        "company_name": "JPMorgan Chase",
        "slug": "jpmorgan",
        "krishna_key": "jpmorgan",
        "sean_slug": "jpmorgan",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg"
    },
    {
        "company_name": "Atlassian",
        "slug": "atlassian",
        "krishna_key": "atlassian",
        "sean_slug": "atlassian",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/00/Atlassian-logo-blue.svg"
    },
    {
        "company_name": "Infosys",
        "slug": "infosys",
        "krishna_key": "infosys",
        "sean_slug": "infosys",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg"
    },
    {
        "company_name": "Zoho",
        "slug": "zoho",
        "krishna_key": "zoho",
        "sean_slug": "zoho",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Zoho_Corporation_logo.svg"
    },
    {
        "company_name": "Paytm",
        "slug": "paytm",
        "krishna_key": "paytm",
        "sean_slug": "paytm",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo.svg"
    },
    {
        "company_name": "PhonePe",
        "slug": "phonepe",
        "krishna_key": "phonepe",
        "sean_slug": "phonepe",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/PhonePe_Logo.svg"
    },
    {
        "company_name": "Cisco",
        "slug": "cisco",
        "krishna_key": "cisco",
        "sean_slug": "cisco",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg"
    },
    {
        "company_name": "Samsung",
        "slug": "samsung",
        "krishna_key": "samsung",
        "sean_slug": "samsung",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg"
    },
    {
        "company_name": "Intuit",
        "slug": "intuit",
        "krishna_key": "intuit",
        "sean_slug": "intuit",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Intuit_Logo.svg"
    },
    {
        "company_name": "Salesforce",
        "slug": "salesforce",
        "krishna_key": "salesforce",
        "sean_slug": "salesforce",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg"
    },
    {
        "company_name": "PayPal",
        "slug": "paypal",
        "krishna_key": "paypal",
        "sean_slug": "paypal",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
    }
]

# ---------------------------------------------------------------------------
# Pydantic Schemas for Validation
# ---------------------------------------------------------------------------
class ProblemSchema(BaseModel):
    leetcode_slug: str
    title: str
    frequency_score: int = Field(..., ge=1, le=10)
    topic_tags: List[str]

    @field_validator("leetcode_slug", "title")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class GuidelinesSchema(BaseModel):
    interview_format: List[str]
    key_topics_weightage: Dict[str, str]
    behavioral_focus: str
    common_rejection_reasons: List[str]

class RoleSchema(BaseModel):
    role_name: str
    level: str
    guidelines: GuidelinesSchema
    problems: List[ProblemSchema]

class CompanySchema(BaseModel):
    company_name: str
    slug: str
    logo_url: str
    roles: List[RoleSchema]

# ---------------------------------------------------------------------------
# Scraping & Helper Utilities
# ---------------------------------------------------------------------------
def get_random_headers() -> Dict[str, str]:
    """Returns HTTP headers with a randomly selected User-Agent."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
    }

def rate_limit_delay(min_sec: float = 1.5, max_sec: float = 3.5) -> None:
    """Implements rate limiting with random delay to prevent IP bans."""
    delay = random.uniform(min_sec, max_sec)
    logger.debug(f"Sleeping for {delay:.2f} seconds...")
    time.sleep(delay)

def extract_leetcode_slug(url_or_slug: str) -> Optional[str]:
    """
    Extracts clean LeetCode problem slug from full URL or raw string.
    Example: 'https://leetcode.com/problems/two-sum/' -> 'two-sum'
    """
    if not url_or_slug:
        return None
    url_or_slug = url_or_slug.strip()
    match = re.search(r'leetcode\.com/problems/([^/]+)', url_or_slug, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    
    # Handle if already a clean slug or path fragment
    slug = url_or_slug.strip('/').split('/')[-1]
    slug = re.sub(r'[^a-zA-Z0-9-]', '', slug).lower()
    return slug if slug else None

# ---------------------------------------------------------------------------
# Data Source Fetchers
# ---------------------------------------------------------------------------
def fetch_sean_prashad_patterns(session: requests.Session) -> Dict[str, List[Dict[str, Any]]]:
    """
    Scrapes curated LeetCode pattern questions from Sean Prashad's repository.
    Source: https://raw.githubusercontent.com/seanprashad/leetcode-patterns/main/src/data/questions.json
    """
    url = "https://raw.githubusercontent.com/seanprashad/leetcode-patterns/main/src/data/questions.json"
    company_problems: Dict[str, List[Dict[str, Any]]] = {}
    
    try:
        logger.info("Fetching Sean Prashad LeetCode patterns data...")
        rate_limit_delay(1.5, 3.0)
        res = session.get(url, headers=get_random_headers(), timeout=15)
        res.raise_for_status()
        
        soup = BeautifulSoup(res.content, "html.parser")
        raw_json = json.loads(soup.text)
        
        questions = raw_json.get("data", [])
        logger.info(f"Loaded {len(questions)} total questions from Sean Prashad dataset.")
        
        for q in questions:
            slug = q.get("slug")
            title = q.get("title")
            pattern_tags = q.get("pattern", [])
            if isinstance(pattern_tags, str):
                pattern_tags = [pattern_tags]
            
            companies = q.get("companies", [])
            for c in companies:
                c_slug = c.get("slug", "").lower()
                freq = c.get("frequency", 1)
                
                if c_slug not in company_problems:
                    company_problems[c_slug] = []
                
                company_problems[c_slug].append({
                    "leetcode_slug": slug,
                    "title": title,
                    "raw_frequency": freq,
                    "topic_tags": pattern_tags,
                    "source": "sean_prashad"
                })
                
    except Exception as e:
        logger.error(f"Error fetching Sean Prashad LeetCode patterns: {e}", exc_info=True)
    
    return company_problems

def fetch_krishna_dey_csv(session: requests.Session, krishna_key: str) -> List[Dict[str, Any]]:
    """
    Scrapes company-wise LeetCode CSV from Krishna Dey's repository with automatic suffix fallbacks.
    Tries: {krishna_key}_2year.csv -> {krishna_key}_1year.csv -> {krishna_key}_6months.csv -> {krishna_key}_alltime.csv
    """
    suffixes = ["2year.csv", "1year.csv", "6months.csv", "alltime.csv"]
    problems = []
    success_url = None

    for suffix in suffixes:
        url = f"https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/{krishna_key}_{suffix}"
        try:
            logger.info(f"Trying Krishna Dey CSV URL: {url}...")
            rate_limit_delay(1.0, 2.0)
            res = session.get(url, headers=get_random_headers(), timeout=10)
            if res.status_code == 200:
                success_url = url
                lines = res.text.splitlines()
                reader = csv.DictReader(lines)
                
                for row in reader:
                    link = row.get("Leetcode Question Link", "")
                    title = row.get("Title", "")
                    freq_str = row.get("Frequency", "1")
                    
                    slug = extract_leetcode_slug(link)
                    if not slug and title:
                        slug = extract_leetcode_slug(title)
                        
                    try:
                        freq = float(freq_str)
                    except ValueError:
                        freq = 1.0
                        
                    if slug and title:
                        problems.append({
                            "leetcode_slug": slug,
                            "title": title.strip(),
                            "raw_frequency": freq,
                            "topic_tags": [],
                            "source": "krishna_dey"
                        })
                break
        except Exception as e:
            logger.debug(f"Failed to fetch {url}: {e}")
            continue

    if success_url:
        logger.info(f"Retrieved {len(problems)} problems for '{krishna_key}' from {success_url}")
    else:
        logger.warning(f"Could not find valid Krishna Dey CSV for company key: '{krishna_key}'")

    return problems

# ---------------------------------------------------------------------------
# Company Interview Guidelines & Roles Generator
# ---------------------------------------------------------------------------
def build_company_roles(company_name: str, aggregated_problems: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates role-specific guidelines and partitions/assigns problem sets per role level.
    Summarizes interview guidelines, format, behavioral focus, and rejection reasons.
    """
    sorted_probs = sorted(aggregated_problems, key=lambda x: x["raw_frequency"], reverse=True)
    
    def get_role_problems(start_idx: int, count: int) -> List[Dict[str, Any]]:
        subset = sorted_probs[start_idx : start_idx + count]
        if not subset and sorted_probs:
            subset = sorted_probs[:count]
        return subset

    roles_data = []

    if company_name == "Amazon":
        roles_data = [
            {
                "role_name": "SDE-1 (Backend / Fullstack)",
                "level": "New Grad & L4",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment (OA): 2 Coding Questions + Work Simulation + Behavioral",
                        "Technical Screen: 1 Coding Problem (Data Structures/Algorithms) + LP",
                        "Onsite (4 Rounds): 3 Coding & Algorithms rounds + 1 System/Object-Oriented Design round",
                        "Every round reserves 15-20 minutes for Amazon Leadership Principles (LP)"
                    ],
                    "key_topics_weightage": {
                        "Trees & Graphs (BFS/DFS)": "30%",
                        "Arrays & Hash Tables": "25%",
                        "Dynamic Programming & Greedy": "20%",
                        "System Design & OOD": "15%",
                        "Strings & Two Pointers": "10%"
                    },
                    "behavioral_focus": "Amazon 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep). STAR method required.",
                    "common_rejection_reasons": [
                        "Failing to provide concrete STAR examples for Leadership Principles",
                        "Inability to analyze and optimize Time/Space complexity",
                        "Ignoring boundary conditions and edge cases in Tree/Graph problems"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "SDE-2 (Mid Level)",
                "level": "Mid L5",
                "guidelines": {
                    "interview_format": [
                        "Technical Phone Screen: 1 Advanced DSA + LP",
                        "Onsite (4 Rounds): 2 DSA Coding + 1 System Design (HLD/LLD) + 1 Bar Raiser Round",
                        "Deep dive into scalability, fault tolerance, and trade-offs"
                    ],
                    "key_topics_weightage": {
                        "System Design & Distributed Systems": "35%",
                        "Graphs & Dynamic Programming": "30%",
                        "Design Data Structures (LRU, Trie)": "20%",
                        "Arrays & Hashing": "15%"
                    },
                    "behavioral_focus": "Ownership, Customer Obsession, Invent and Simplify, Delivering Results at scale.",
                    "common_rejection_reasons": [
                        "Weak System Design architecture and failure to handle high concurrency",
                        "Struggling to justify architectural trade-offs during Bar Raiser round"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    elif company_name == "Google":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "New Grad (L3)",
                "guidelines": {
                    "interview_format": [
                        "Technical Phone Screen (45 min): 1-2 Algorithm & Data Structure problems",
                        "Onsite (4 Technical + 1 Behavioral/Googliness): 45 minutes each",
                        "Strict evaluation on optimal code, edge cases, and clean problem solving"
                    ],
                    "key_topics_weightage": {
                        "Graphs & Trees (BFS/DFS, Topological Sort)": "35%",
                        "Dynamic Programming & Recursion": "25%",
                        "Arrays, Two Pointers & Binary Search": "25%",
                        "Strings & Tries": "15%"
                    },
                    "behavioral_focus": "Googliness & Leadership: Navigating ambiguity, ethical decision making, collaboration.",
                    "common_rejection_reasons": [
                        "Writing unoptimized or brute-force solutions without reaching optimal complexity",
                        "Poor communication of thought process while coding",
                        "Missing edge cases (empty input, integer overflow, disconnected graphs)"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "Software Engineer",
                "level": "Mid Level (L4)",
                "guidelines": {
                    "interview_format": [
                        "Phone Screen: 1 Medium/Hard DSA Problem",
                        "Onsite (4 Rounds): 3 Advanced DSA Coding + 1 System Design + Googliness"
                    ],
                    "key_topics_weightage": {
                        "Advanced Graph Algorithms & Dynamic Programming": "35%",
                        "System Design & Scalability": "30%",
                        "Data Structures Design & Heaps/Trees": "20%",
                        "Sliding Window & Hash Maps": "15%"
                    },
                    "behavioral_focus": "Thriving in ambiguity, peer leadership, technical ownership.",
                    "common_rejection_reasons": [
                        "Failing the System Design round on scalability",
                        "Slow coding speed preventing completion of 2 problems per round"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    elif company_name == "Meta":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "New Grad & E3/E4",
                "guidelines": {
                    "interview_format": [
                        "Technical Screen (45 min): 2 Coding Questions (Speed and accuracy critical)",
                        "Onsite (4 Rounds): 2 Coding Rounds (2 problems each in 45 min) + 1 System Architecture + 1 Behavioral"
                    ],
                    "key_topics_weightage": {
                        "Binary Trees & BFS/DFS": "30%",
                        "Arrays & Two Pointers / Sliding Window": "30%",
                        "Strings & Recursion": "20%",
                        "Hash Tables & Heaps": "20%"
                    },
                    "behavioral_focus": "Meta Core Values: Move Fast, Focus on Long-Term Impact, Build Awesome Things.",
                    "common_rejection_reasons": [
                        "Failing to solve BOTH coding questions within 45 minutes",
                        "Syntax errors or unhandled boundary conditions"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Microsoft":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "SDE-1 & SDE-2 (L59-L62)",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment: 2-3 Coding Problems",
                        "Onsite Loop (4 Rounds): 45-60 min rounds combining Coding, Object-Oriented Design, and Behavioral"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Strings": "30%",
                        "Trees & Linked Lists": "25%",
                        "Dynamic Programming & Math": "20%",
                        "Object-Oriented Design": "15%",
                        "Graphs & Sorting": "10%"
                    },
                    "behavioral_focus": "Growth Mindset, One Microsoft, Customer Obsession.",
                    "common_rejection_reasons": [
                        "Failing to write modular, reusable code during whiteboarding/coding",
                        "Inability to explain runtime complexity clearly"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Flipkart":
        roles_data = [
            {
                "role_name": "SDE-1 (Backend / Mobile)",
                "level": "New Grad & SDE-1",
                "guidelines": {
                    "interview_format": [
                        "Machine Coding Round (90-120 min): Write production-ready executable Object-Oriented code (e.g. Parking Lot, Splitwise, Ride Sharing)",
                        "PS / DS Round: 2 Data Structures & Algorithms Problems (Focus on Trees, Graphs, DP)",
                        "Hiring Manager & Culture Fit Round"
                    ],
                    "key_topics_weightage": {
                        "Object Oriented Design & Machine Coding": "35%",
                        "Trees & Graphs (BFS/DFS)": "25%",
                        "Dynamic Programming": "20%",
                        "Arrays & Two Pointers": "20%"
                    },
                    "behavioral_focus": "Audacity, Bias for Action, Customer Obsession, Integrity.",
                    "common_rejection_reasons": [
                        "Failing the Machine Coding round due to uncompilable code or missing OOP design patterns",
                        "Inability to write clean unit-testable code under timed conditions"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "SDE-2 (Backend)",
                "level": "Mid Level",
                "guidelines": {
                    "interview_format": [
                        "Machine Coding Round (Low Level Design)",
                        "Problem Solving & Data Structures Round",
                        "High Level System Design Round (E-commerce Flash Sale, Cart System, Inventory Locking)",
                        "Managerial / Culture Round"
                    ],
                    "key_topics_weightage": {
                        "System Design & Scalability": "40%",
                        "Machine Coding & LLD": "30%",
                        "Graphs & DP": "30%"
                    },
                    "behavioral_focus": "Ownership, handling high-concurrency traffic spike scenarios.",
                    "common_rejection_reasons": [
                        "Weak concurrency control or database lock handling in flash sale scenarios"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    elif company_name == "Goldman Sachs":
        roles_data = [
            {
                "role_name": "Analyst (Software Engineer)",
                "level": "New Grad & Early Career",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment (HackerRank): Math/Aptitude + 2 Coding Questions (Advanced DP/Strings/Trees)",
                        "Technical Rounds (3-4 Rounds): DSA Coding, CS Fundamentals, Math Logic",
                        "Behavioral & Fitment Round"
                    ],
                    "key_topics_weightage": {
                        "Dynamic Programming & Math": "35%",
                        "Arrays & Hash Tables": "25%",
                        "Strings & Two Pointers": "20%",
                        "Trees & Graphs": "20%"
                    },
                    "behavioral_focus": "Integrity, Excellence, Client First, Teamwork.",
                    "common_rejection_reasons": [
                        "Failing mathematical optimization constraints in DP problems",
                        "Slow speed on HackerRank online assessment"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Adobe":
        roles_data = [
            {
                "role_name": "Member of Technical Staff (MTS)",
                "level": "New Grad & MTS-1/MTS-2",
                "guidelines": {
                    "interview_format": [
                        "Online Test: CS Fundamentals + Aptitude + 2 Coding Questions",
                        "Technical Interviews (3-4 Rounds): Coding (DP, Trees, Strings), OS/Memory concepts, LLD",
                        "Managerial & HR Round"
                    ],
                    "key_topics_weightage": {
                        "Dynamic Programming & Trees": "35%",
                        "Arrays & Strings": "30%",
                        "Object-Oriented Design": "20%",
                        "OS & Memory Management": "15%"
                    },
                    "behavioral_focus": "Genuine, Exceptional, Innovative, Involved.",
                    "common_rejection_reasons": [
                        "Incomplete DP solutions or failure to optimize memory complexity",
                        "Weak understanding of OS/C++ memory management"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Oracle":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "IC1 / IC2",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment: Aptitude, SQL/Database MCQs, DSA Coding",
                        "Technical Rounds (3 Rounds): DSA Coding, SQL & Database internals, Multithreading",
                        "HR Round"
                    ],
                    "key_topics_weightage": {
                        "SQL & Database Internals": "30%",
                        "Arrays & Linked Lists": "25%",
                        "Trees & Graphs": "25%",
                        "Dynamic Programming": "20%"
                    },
                    "behavioral_focus": "Quality, Customer Success, Team Alignment.",
                    "common_rejection_reasons": [
                        "Weak SQL queries or lack of DB indexing knowledge",
                        "Suboptimal tree traversal solutions"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Walmart Global Tech":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "SDE-1 & SDE-2",
                "guidelines": {
                    "interview_format": [
                        "Unstop / HackerRank Online Assessment",
                        "Technical Interviews (3 Rounds): Data Structures, Algorithms, System Design for Retail Scale",
                        "Managerial / Behavioral Round"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Hashing": "30%",
                        "Trees & Graphs": "30%",
                        "Dynamic Programming": "20%",
                        "System Design & Database Schema": "20%"
                    },
                    "behavioral_focus": "Service to Customer, Respect for Individual, Strive for Excellence.",
                    "common_rejection_reasons": [
                        "Inability to write clean scalable logic for large datasets",
                        "Failing System Design round on schema normalization and caching"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "JPMorgan Chase":
        roles_data = [
            {
                "role_name": "Software Engineer (SEP)",
                "level": "New Grad & Analyst",
                "guidelines": {
                    "interview_format": [
                        "HackerRank Assessment / Code For Good Hackathon",
                        "Technical Interviews (2-3 Rounds): DSA, OOPs, SQL, Real-time Financial Data Processing",
                        "Behavioral & HR Round"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Strings": "30%",
                        "Object Oriented Programming": "25%",
                        "Trees & Hashing": "25%",
                        "SQL & Database Design": "20%"
                    },
                    "behavioral_focus": "Integrity, Operational Excellence, Teamwork.",
                    "common_rejection_reasons": [
                        "Lack of clean OOP structure",
                        "Poor collaboration during group hackathon / technical evaluation"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Atlassian":
        roles_data = [
            {
                "role_name": "Graduate / Software Engineer",
                "level": "P30 Level",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment (HackerRank)",
                        "Code Design / Craftsmanship Round: Extend and refactor a real-world codebase with clean tests",
                        "System Design Round: Real-time collaboration, Jira/Confluence scale",
                        "Values & Leadership Round"
                    ],
                    "key_topics_weightage": {
                        "Code Craftsmanship & Refactoring": "40%",
                        "System Design & Concurrency": "30%",
                        "Trees, Graphs & DP": "30%"
                    },
                    "behavioral_focus": "Open company, no BS; Build with heart and balance; Play, as a team; Be the change you seek.",
                    "common_rejection_reasons": [
                        "Failing Code Craftsmanship round due to poor code structuring or lack of unit tests",
                        "Inadequate communication during pair-programming"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Infosys":
        roles_data = [
            {
                "role_name": "Specialist Programmer (SP) / DSE",
                "level": "Digital Specialist & Power Programmer",
                "guidelines": {
                    "interview_format": [
                        "HackWithInfy / InfyTQ Online Coding Challenge (3 Competitive Coding Problems)",
                        "Technical Interview: Deep dive into Competitive Programming code, Graphs, DP, CS Core",
                        "HR Round"
                    ],
                    "key_topics_weightage": {
                        "Dynamic Programming & Math": "40%",
                        "Graph Theory & Advanced Trees": "35%",
                        "Arrays & Strings": "25%"
                    },
                    "behavioral_focus": "Adaptability, Continuous Learning, Problem Solving.",
                    "common_rejection_reasons": [
                        "Inability to pass all hidden test cases in competitive programming problems",
                        "Weak understanding of time complexity limits (TLE)"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Zoho":
        roles_data = [
            {
                "role_name": "Software Developer",
                "level": "Level 1 to Level 5",
                "guidelines": {
                    "interview_format": [
                        "Round 1: C/C++ Basic Programming & Flowcharts",
                        "Round 2: Advanced Programming (Complex logic without using built-in high-level libraries)",
                        "Round 3: Design / System Design (Taxi Booking, Railway Reservation System)",
                        "Round 4 & 5: Tech HR & General HR"
                    ],
                    "key_topics_weightage": {
                        "Array & String Manipulation (No Libs)": "40%",
                        "Object-Oriented System Design": "35%",
                        "Recursion & Pointers": "25%"
                    },
                    "behavioral_focus": "Dedication, Hard Work, Long-term commitment.",
                    "common_rejection_reasons": [
                        "Relying on high-level library functions during Round 2 logic evaluation",
                        "Failure to build a complete working prototype for Round 3 System Design"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name in ["Paytm", "PhonePe"]:
        roles_data = [
            {
                "role_name": "Software Engineer (Backend)",
                "level": "SDE-1 & SDE-2",
                "guidelines": {
                    "interview_format": [
                        "Machine Coding / DSA Round: Build High-Concurrency Payment Gateway Simulator or Ledger System",
                        "DSA Round: Graphs, Dynamic Programming, Heap/Priority Queue",
                        "System Design Round: Distributed Transactions, Idempotency, ACID in Fintech",
                        "Managerial Round"
                    ],
                    "key_topics_weightage": {
                        "System Design & Idempotency": "40%",
                        "Machine Coding & LLD": "30%",
                        "Graphs & DP": "30%"
                    },
                    "behavioral_focus": "Bias for Action, Extreme Speed, Ownership.",
                    "common_rejection_reasons": [
                        "Missing idempotency or race-condition checks in payment system design",
                        "Slow execution in machine coding round"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    elif company_name == "Samsung":
        roles_data = [
            {
                "role_name": "Software Engineer (SWC)",
                "level": "Campus & Lateral",
                "guidelines": {
                    "interview_format": [
                        "Samsung Advanced Software Competency Test (3-Hour 1-Problem Test in C/C++/Java)",
                        "Strict evaluation: 100% test cases must pass (Graph BFS/DFS, Backtracking, DP)",
                        "Technical Interview (Project & Code discussion)",
                        "HR Round"
                    ],
                    "key_topics_weightage": {
                        "Graph Algorithms (BFS/DFS/Shortest Path)": "45%",
                        "Backtracking & Recursion": "35%",
                        "Dynamic Programming": "20%"
                    },
                    "behavioral_focus": "Perseverance, Technical Perfection, Respect.",
                    "common_rejection_reasons": [
                        "Failing even 1 test case out of 50 in the 3-hour Competency Test",
                        "Exceeding time or memory limit constraints"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    # Default fallback for Cisco, Intuit, Salesforce, PayPal, etc.
    if not roles_data:
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "SDE-1 & SDE-2",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment (2-3 Coding Problems)",
                        "Technical Round 1: DSA (Arrays, Trees, Graphs, DP)",
                        "Technical Round 2: Low-Level Design / System Design",
                        "Managerial / HR Round"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Hash Tables": "30%",
                        "Trees & Graphs": "30%",
                        "Dynamic Programming": "20%",
                        "System Design & OOP": "20%"
                    },
                    "behavioral_focus": "Technical Excellence, Team Collaboration, Customer Focus.",
                    "common_rejection_reasons": [
                        "Suboptimal time complexity solutions",
                        "Inadequate communication of algorithmic logic"
                    ]
                },
                "problems": get_role_problems(0, 30)
            }
        ]

    return roles_data

# ---------------------------------------------------------------------------
# Aggregation & Normalization Core Engine
# ---------------------------------------------------------------------------
def aggregate_and_normalize_company_data(
    company_info: Dict[str, str],
    sean_data: Dict[str, List[Dict[str, Any]]],
    session: requests.Session
) -> Dict[str, Any]:
    """
    Scrapes, merges, deduplicates, and normalizes problem frequency data for a company.
    Calculates frequency score on a strict 1-10 scale.
    """
    company_name = company_info["company_name"]
    c_slug = company_info["slug"]
    krishna_key = company_info["krishna_key"]
    sean_slug = company_info["sean_slug"]
    logo_url = company_info["logo_url"]

    logger.info(f"--- Processing data pipeline for: {company_name} ---")

    # Step 1: Fetch raw problems from Krishna Dey CSV with suffix fallbacks
    krishna_probs = fetch_krishna_dey_csv(session, krishna_key)

    # Step 2: Fetch raw problems from Sean Prashad dataset
    sean_probs = sean_data.get(sean_slug, [])

    # Step 3: Merge & Deduplicate problems by leetcode_slug
    problem_map: Dict[str, Dict[str, Any]] = {}

    # Insert Krishna Dey problems
    for p in krishna_probs:
        slug = p["leetcode_slug"]
        problem_map[slug] = {
            "leetcode_slug": slug,
            "title": p["title"],
            "raw_frequency": p["raw_frequency"],
            "topic_tags": set(p["topic_tags"])
        }

    # Merge Sean Prashad problems
    for p in sean_probs:
        slug = p["leetcode_slug"]
        if slug in problem_map:
            problem_map[slug]["raw_frequency"] += p["raw_frequency"]
            problem_map[slug]["topic_tags"].update(p["topic_tags"])
        else:
            problem_map[slug] = {
                "leetcode_slug": slug,
                "title": p["title"],
                "raw_frequency": p["raw_frequency"],
                "topic_tags": set(p["topic_tags"])
            }

    raw_problem_list = list(problem_map.values())
    if not raw_problem_list:
        logger.warning(f"No problems found for company {company_name}!")
        freq_normalized_problems = []
    else:
        # Step 4: Calculate frequency_score (1-10 scale)
        frequencies = [item["raw_frequency"] for item in raw_problem_list]
        min_freq = min(frequencies)
        max_freq = max(frequencies)

        freq_normalized_problems = []
        for item in raw_problem_list:
            raw_f = item["raw_frequency"]
            if max_freq == min_freq:
                score = 5
            else:
                scaled = 1 + 9 * (raw_f - min_freq) / (max_freq - min_freq)
                score = max(1, min(10, int(round(scaled))))

            tags = sorted(list(item["topic_tags"])) if item["topic_tags"] else ["Algorithms"]
            freq_normalized_problems.append({
                "leetcode_slug": item["leetcode_slug"],
                "title": item["title"],
                "frequency_score": score,
                "raw_frequency": raw_f,
                "topic_tags": tags
            })

    # Step 5: Build structured Role Guidelines
    roles = build_company_roles(company_name, freq_normalized_problems)

    return {
        "company_name": company_name,
        "slug": c_slug,
        "logo_url": logo_url,
        "roles": roles
    }

# ---------------------------------------------------------------------------
# Main Orchestration Function
# ---------------------------------------------------------------------------
def main():
    logger.info("==================================================")
    logger.info("Starting DSA Interview Data Scraper & Aggregator")
    logger.info("==================================================")

    session = requests.Session()

    # Pre-fetch global patterns dataset
    sean_patterns = fetch_sean_prashad_patterns(session)

    validated_companies = []

    # Iterate and process each target company
    for comp in TARGET_COMPANIES:
        try:
            raw_company_dict = aggregate_and_normalize_company_data(comp, sean_patterns, session)

            # Validate output against Pydantic schema
            validated_obj = CompanySchema(**raw_company_dict)
            validated_companies.append(validated_obj.model_dump())
            logger.info(f"Successfully scraped & validated data for {comp['company_name']}.")

        except Exception as e:
            logger.error(f"Error processing company {comp['company_name']}: {e}", exc_info=True)
            continue

    # Write output JSON file to frontend/src/data/companies_data.json
    output_dir = os.path.join(os.getcwd(), "frontend", "src", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "companies_data.json")

    logger.info(f"Saving final aggregated dataset to: {output_file}")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(validated_companies, f, indent=2, ensure_ascii=False)

    logger.info("==================================================")
    logger.info(f"Scraping Complete! Successfully exported {len(validated_companies)} companies to {output_file}")
    logger.info("==================================================")

if __name__ == "__main__":
    main()
