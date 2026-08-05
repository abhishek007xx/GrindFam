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

def rate_limit_delay(min_sec: float = 2.0, max_sec: float = 5.0) -> None:
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
        
        # Parse output using BeautifulSoup / JSON
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
    Scrapes company-wise LeetCode CSV from Krishna Dey's repository.
    Source: https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/{krishna_key}_2year.csv
    """
    url = f"https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/{krishna_key}_2year.csv"
    problems = []
    
    try:
        logger.info(f"Fetching Krishna Dey LeetCode CSV for company key: '{krishna_key}'...")
        rate_limit_delay(2.0, 4.0)
        res = session.get(url, headers=get_random_headers(), timeout=15)
        res.raise_for_status()
        
        content = res.text
        lines = content.splitlines()
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
                
        logger.info(f"Retrieved {len(problems)} problems for {krishna_key} from Krishna Dey CSV.")
        
    except Exception as e:
        logger.error(f"Failed to fetch Krishna Dey CSV for '{krishna_key}': {e}")
        
    return problems

# ---------------------------------------------------------------------------
# Company Interview Guidelines & Roles Generator
# ---------------------------------------------------------------------------
def build_company_roles(company_name: str, aggregated_problems: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates role-specific guidelines and partitions/assigns problem sets per role level.
    Summarizes interview guidelines, format, behavioral focus, and rejection reasons.
    """
    # Sort aggregated problems by raw frequency descending
    sorted_probs = sorted(aggregated_problems, key=lambda x: x["raw_frequency"], reverse=True)
    
    # Helper to slice problem subsets per level
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
                    "behavioral_focus": "Amazon 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep, Have Backbone; Disagree and Commit). Must use STAR format.",
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
            },
            {
                "role_name": "Senior Software Engineer",
                "level": "Senior L6",
                "guidelines": {
                    "interview_format": [
                        "Onsite (5 Rounds): 2 High Level System Design + 1 System Architecture + 1 Coding + 1 Executive Leadership",
                        "Focus on multi-team architectural leadership and organizational impact"
                    ],
                    "key_topics_weightage": {
                        "High Level System Design & Architecture": "50%",
                        "Object-Oriented & Low Level Design": "25%",
                        "Complex Data Structures & Optimization": "25%"
                    },
                    "behavioral_focus": "Earn Trust, Think Big, Hire and Develop the Best, Strategic Vision.",
                    "common_rejection_reasons": [
                        "Lack of high-level system design depth and scalability strategies",
                        "Inadequate demonstration of cross-functional leadership"
                    ]
                },
                "problems": get_role_problems(10, 25)
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
                        "Strict evaluation on optimal code, edge cases, and clean problem solving without boilerplate"
                    ],
                    "key_topics_weightage": {
                        "Graphs & Trees (BFS/DFS, Topological Sort, Dijkstra)": "35%",
                        "Dynamic Programming & Recursion": "25%",
                        "Arrays, Two Pointers & Binary Search": "25%",
                        "Strings & Tries": "15%"
                    },
                    "behavioral_focus": "Googliness & Leadership: Navigating ambiguity, ethical decision making, collaboration, and constructive feedback.",
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
                        "Onsite (4 Rounds): 3 Advanced DSA Coding + 1 System Design (HLD/API Design) + Googliness",
                        "Emphasis on trade-off analysis and production-ready code quality"
                    ],
                    "key_topics_weightage": {
                        "Advanced Graph Algorithms & Dynamic Programming": "35%",
                        "System Design & Scalability": "30%",
                        "Data Structures Design & Heaps/Trees": "20%",
                        "Sliding Window & Hash Maps": "15%"
                    },
                    "behavioral_focus": "Thriving in ambiguity, peer leadership, technical ownership, and user empathy.",
                    "common_rejection_reasons": [
                        "Failing the System Design round on scalability or API boundaries",
                        "Slow coding speed preventing completion of 2 problems per round"
                    ]
                },
                "problems": get_role_problems(5, 30)
            },
            {
                "role_name": "Senior Software Engineer",
                "level": "Senior Level (L5)",
                "guidelines": {
                    "interview_format": [
                        "Onsite (5 Rounds): 2 System Design + 2 Advanced Coding/Algorithms + 1 Leadership/Googliness",
                        "Expectations of mastery in distributed infrastructure and API design"
                    ],
                    "key_topics_weightage": {
                        "Distributed Systems & Scalable Architecture": "45%",
                        "Complex Algorithms & Optimization": "35%",
                        "System Design & Reliability": "20%"
                    },
                    "behavioral_focus": "Engineering excellence, team mentorship, strategic influence, handling project ambiguity.",
                    "common_rejection_reasons": [
                        "Superficial system design answers lacking deep dive into bottleneck resolution",
                        "Failure to demonstrate technical leadership"
                    ]
                },
                "problems": get_role_problems(12, 25)
            }
        ]

    elif company_name == "Meta":
        roles_data = [
            {
                "role_name": "Software Engineer (Product / Infrastructure)",
                "level": "New Grad (E3)",
                "guidelines": {
                    "interview_format": [
                        "Technical Screen (45 min): 2 Coding Questions (Speed and accuracy are critical)",
                        "Onsite (4 Rounds): 2 Coding Rounds (2 problems each in 45 min) + 1 System/Architecture Round + 1 Behavioral/Culture Round",
                        "Must write bug-free code fast with optimal time/space complexity"
                    ],
                    "key_topics_weightage": {
                        "Binary Trees & BFS/DFS": "30%",
                        "Arrays & Two Pointers / Sliding Window": "30%",
                        "Strings & Recursion": "20%",
                        "Hash Tables & Heaps": "20%"
                    },
                    "behavioral_focus": "Meta Core Values: Move Fast, Focus on Long-Term Impact, Build Awesome Things, Be Direct and Respect Your Colleagues.",
                    "common_rejection_reasons": [
                        "Failing to solve BOTH coding questions within the 45-minute window",
                        "Syntax errors or unhandled boundary conditions in code",
                        "Overcomplicating straightforward algorithm requirements"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "Software Engineer",
                "level": "Mid Level (E4)",
                "guidelines": {
                    "interview_format": [
                        "Technical Screen: 2 Coding Problems",
                        "Onsite: 2 Coding Rounds + 1 Product Architecture / System Design Round + 1 Behavioral Round",
                        "High expectation for clean, executable-level code structure"
                    ],
                    "key_topics_weightage": {
                        "System Design & Product Architecture": "35%",
                        "Trees, Graphs & Dynamic Programming": "35%",
                        "Arrays, Hashing & String Manipulation": "30%"
                    },
                    "behavioral_focus": "Driving impact, taking initiative, executing quickly with quality.",
                    "common_rejection_reasons": [
                        "Inability to design practical APIs and database schemas in Product Architecture",
                        "Incomplete implementation of second coding question"
                    ]
                },
                "problems": get_role_problems(5, 30)
            },
            {
                "role_name": "Senior Software Engineer",
                "level": "Senior Level (E5)",
                "guidelines": {
                    "interview_format": [
                        "Onsite: 2 System Design Rounds (HLD) + 2 Coding Rounds + 1 Behavioral/Leadership Round",
                        "Evaluation centered around driving company-wide engineering solutions"
                    ],
                    "key_topics_weightage": {
                        "System Design & Large-Scale Systems": "50%",
                        "Advanced Data Structures & Algorithms": "30%",
                        "Behavioral & Engineering Leadership": "20%"
                    },
                    "behavioral_focus": "Cross-functional execution, mentorship, scaling engineering systems, bold bets.",
                    "common_rejection_reasons": [
                        "Shallow system design proposals for high-throughput messaging or caching",
                        "Lack of clear ownership in complex technical projects"
                    ]
                },
                "problems": get_role_problems(10, 25)
            }
        ]

    elif company_name == "Microsoft":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "New Grad (SDE-1 / L59-60)",
                "guidelines": {
                    "interview_format": [
                        "Online Assessment: 2-3 Coding Problems",
                        "Onsite / Final Loop (3-4 Rounds): 45-60 min rounds combining Coding, Object-Oriented Design, and Behavioral",
                        "Strong emphasis on clean code, modular design, and collaboration"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Strings": "30%",
                        "Trees & Linked Lists": "25%",
                        "Dynamic Programming & Math": "20%",
                        "Object-Oriented Design": "15%",
                        "Graphs & Sorting": "10%"
                    },
                    "behavioral_focus": "Growth Mindset, One Microsoft, Diversity & Inclusion, Customer Obsession.",
                    "common_rejection_reasons": [
                        "Failing to write modular, reusable code during whiteboarding/coding",
                        "Inability to explain runtime complexity and memory trade-offs clearly"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "Software Engineer 2",
                "level": "Mid Level (SDE-2 / L61-62)",
                "guidelines": {
                    "interview_format": [
                        "Phone Screen: 1 Coding + OOD",
                        "Onsite Loop (4 Rounds): 2 DSA Coding + 1 System Design (Azure/Cloud focus) + 1 As-If / AA Round",
                        "Focus on production readiness and cloud service architecture"
                    ],
                    "key_topics_weightage": {
                        "System Design & Cloud Architecture": "35%",
                        "Trees, Graphs & Dynamic Programming": "35%",
                        "Design Data Structures & Multithreading": "30%"
                    },
                    "behavioral_focus": "Customer impact, cross-team alignment, operational excellence.",
                    "common_rejection_reasons": [
                        "Weak System Design understanding for distributed storage or APIs",
                        "Failure to adapt solution when hints are provided"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    elif company_name == "Uber":
        roles_data = [
            {
                "role_name": "Software Engineer 1",
                "level": "New Grad (L3)",
                "guidelines": {
                    "interview_format": [
                        "Online CodeSignal / HackerRank Assessment",
                        "Technical Phone Screen: 1 Hard/Medium DSA Problem",
                        "Onsite (4 Rounds): 2 Coding (Algorithms + Heavy Data Structure implementation) + 1 Architecture/LLD + 1 Behavioral",
                        "Real-world problem context (e.g., geospatial graphs, routing, dispatch algorithms)"
                    ],
                    "key_topics_weightage": {
                        "Graphs & Dijkstra/Shortest Path": "35%",
                        "Heaps, Trees & Segment Trees": "25%",
                        "Dynamic Programming": "20%",
                        "Arrays & Hash Maps": "20%"
                    },
                    "behavioral_focus": "Go the Extra Mile, Stand for Safety, See the Big Picture, Act like an Owner.",
                    "common_rejection_reasons": [
                        "Struggling with graph traversal and shortest path implementations under pressure",
                        "Unoptimized space complexity in memory-intensive algorithms"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "Software Engineer 2",
                "level": "Mid Level (L4)",
                "guidelines": {
                    "interview_format": [
                        "Phone Screen: 1 Algorithmic Problem",
                        "Onsite: 2 Coding Rounds + 1 High Level System Design (Real-time tracking, dispatch systems) + 1 Behavioral",
                        "Focus on low latency, real-time streaming, and high concurrency"
                    ],
                    "key_topics_weightage": {
                        "Real-Time System Design & Distributed Systems": "40%",
                        "Advanced Graphs & Concurrent Data Structures": "35%",
                        "Arrays & Dynamic Programming": "25%"
                    },
                    "behavioral_focus": "Customer obsession, technical speed with quality, resilience under scale.",
                    "common_rejection_reasons": [
                        "Inability to handle real-time streaming constraints (Kafka, WebSockets) in system design",
                        "Buggy edge case handling in concurrent graph operations"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    elif company_name == "Apple":
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "New Grad / ICT2",
                "guidelines": {
                    "interview_format": [
                        "Recruiter & Technical Phone Screen (45 min)",
                        "Onsite Loop (4-5 Rounds): Team-specific technical interviews (Coding, CS Fundamentals, OS/Memory Management, Behavioral)",
                        "Apple interviews are heavily team-dependent with strong emphasis on perfection and low-level detail"
                    ],
                    "key_topics_weightage": {
                        "Arrays, Strings & Pointers": "30%",
                        "Trees & Bit Manipulation": "25%",
                        "Linked Lists & Data Structure Design": "25%",
                        "CS Fundamentals & OS concepts": "20%"
                    },
                    "behavioral_focus": "Attention to detail, passion for user privacy & quality, collaboration, craftsmanship.",
                    "common_rejection_reasons": [
                        "Lacking deep comprehension of core CS fundamentals (memory, pointers, caching)",
                        "Careless syntax errors or inability to write clean, maintainable code"
                    ]
                },
                "problems": get_role_problems(0, 30)
            },
            {
                "role_name": "Software Engineer 2",
                "level": "Mid Level / ICT3",
                "guidelines": {
                    "interview_format": [
                        "Phone Screen: 1 Technical Coding Problem",
                        "Onsite Loop (5 Rounds): 3 Technical Coding & CS Architecture + 1 System Design + 1 Hiring Manager Round",
                        "Focus on robust API design, performance optimization, and privacy"
                    ],
                    "key_topics_weightage": {
                        "System Design & Local/Cloud Storage": "35%",
                        "Trees, Graphs & Dynamic Programming": "35%",
                        "Arrays, Hashing & Memory Efficiency": "30%"
                    },
                    "behavioral_focus": "Craftsmanship, cross-functional collaboration, discretion, excellence.",
                    "common_rejection_reasons": [
                        "Failure to account for low-memory constraints or hardware optimization",
                        "Unclear architectural boundaries in System Design"
                    ]
                },
                "problems": get_role_problems(5, 30)
            }
        ]

    # Fallback generic role structure if company not matched
    if not roles_data:
        roles_data = [
            {
                "role_name": "Software Engineer",
                "level": "Mid Level",
                "guidelines": {
                    "interview_format": [
                        "Technical Phone Screen (45 min)",
                        "Onsite Loop (4 Rounds): 2 DSA Coding + 1 System Design + 1 Behavioral"
                    ],
                    "key_topics_weightage": {
                        "Arrays & Trees": "40%",
                        "Dynamic Programming & Graphs": "40%",
                        "System Design": "20%"
                    },
                    "behavioral_focus": "Problem solving, communication, teamwork, technical adaptability.",
                    "common_rejection_reasons": [
                        "Suboptimal time complexity solutions",
                        "Inadequate communication of algorithm steps"
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

    # Step 1: Fetch raw problems from Krishna Dey CSV
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
            # Accumulate frequency & union topic tags
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
                # Min-Max Scaling mapped to 1-10 range
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

    # Step 1: Pre-fetch global patterns dataset
    sean_patterns = fetch_sean_prashad_patterns(session)

    validated_companies = []

    # Step 2: Iterate and process each target company
    for comp in TARGET_COMPANIES:
        try:
            raw_company_dict = aggregate_and_normalize_company_data(comp, sean_patterns, session)

            # Step 3: Validate output against Pydantic schema
            validated_obj = CompanySchema(**raw_company_dict)
            validated_companies.append(validated_obj.model_dump())
            logger.info(f"Successfully scraped & validated data for {comp['company_name']}.")

        except Exception as e:
            logger.error(f"Error processing company {comp['company_name']}: {e}", exc_info=True)
            continue

    # Step 4: Write output JSON file to src/data/companies_data.json
    output_dir = os.path.join(os.getcwd(), "src", "data")
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
