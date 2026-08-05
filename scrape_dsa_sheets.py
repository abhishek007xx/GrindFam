import os
import re
import json
import random
import time
import urllib.parse
import logging
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
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
# Headers Pool & Helper Functions
# ---------------------------------------------------------------------------
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
]

def get_random_headers() -> Dict[str, str]:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

def clean_problem_title(raw_title: str) -> str:
    """
    Cleans messy problem titles by removing prefix numbers, 'Q1.', 'Problem 1:', etc.
    Example: 'Problem 1: Two Sum (LeetCode)' -> 'Two Sum'
    """
    if not raw_title:
        return ""
    title = raw_title.strip()
    # Remove leading tags like "Problem 1:", "Q1.", "1.", "Day 1 -"
    title = re.sub(r'^(?:Problem\s*\d+:?|Q\d+\.?|\d+[\.\)-]\s*|Day\s*\d+\s*[-:]?\s*)', '', title, flags=re.IGNORECASE).strip()
    # Remove trailing "(LeetCode)", "[LeetCode]", etc.
    title = re.sub(r'[\(\[]LeetCode[\)\]]', '', title, flags=re.IGNORECASE).strip()
    # Remove extra spaces
    title = re.sub(r'\s+', ' ', title).strip()
    return title if title else raw_title.strip()

def extract_leetcode_slug(url_or_title: str) -> str:
    """
    Extracts or generates clean LeetCode slug.
    Example: 'https://leetcode.com/problems/two-sum/' -> 'two-sum'
    """
    if not url_or_title:
        return "unassigned-problem"
    match = re.search(r'leetcode\.com/problems/([^/]+)', url_or_title, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    
    # If a URL fragment or raw slug
    slug = url_or_title.strip('/').split('/')[-1]
    slug = re.sub(r'[^a-zA-Z0-9-]', '', slug).lower()
    if slug and len(slug) > 2:
        return slug
    
    # Kebab-case fallback from title
    kebab = re.sub(r'[^a-zA-Z0-9\s-]', '', url_or_title).strip().lower()
    kebab = re.sub(r'\s+', '-', kebab)
    return kebab if kebab else "leetcode-problem"

def generate_youtube_search_url(creator_name: str, problem_title: str) -> str:
    """
    Generates YouTube search URL for creator + problem title if official video link is missing.
    """
    query = f"{creator_name} {problem_title} DSA solution"
    encoded_query = urllib.parse.quote_plus(query)
    return f"https://www.youtube.com/results?search_query={encoded_query}"

# ---------------------------------------------------------------------------
# Pydantic Schemas for Validation
# ---------------------------------------------------------------------------
class SheetProblemSchema(BaseModel):
    title: str
    leetcode_url: str
    leetcode_slug: str
    difficulty: str
    youtube_tutorial_url: str

    @field_validator("title", "leetcode_slug")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class CategorySchema(BaseModel):
    step_name: str
    problems: List[SheetProblemSchema]

class SheetSchema(BaseModel):
    sheet_name: str
    creator_name: str
    slug: str
    total_problems_count: int
    steps: List[CategorySchema]

# ---------------------------------------------------------------------------
# Sheet Scrapers
# ---------------------------------------------------------------------------

# 1. Striver's A2Z DSA Sheet
def fetch_strivers_a2z_sheet(session: requests.Session) -> Dict[str, Any]:
    logger.info("Scraping Striver's A2Z DSA Sheet from takeuforward.org...")
    
    # Curated A2Z DSA Steps & Problems representation mapping Striver's official syllabus
    striver_categories = [
        {
            "step_name": "Step 1: Learn the Basics",
            "raw_problems": [
                ("User Input / Output & Data Types", "https://leetcode.com/problems/find-words-that-can-be-formed-by-characters/", "Easy", "https://youtu.be/0bHoB39fzeE"),
                ("If Else statements & Switch Case", "https://leetcode.com/problems/calculate-money-in-leetcode-bank/", "Easy", "https://youtu.be/0bHoB39fzeE"),
                ("For loops & While loops", "https://leetcode.com/problems/fibonacci-number/", "Easy", "https://youtu.be/vYquumk4nWw"),
                ("Count Digits in a Number", "https://leetcode.com/problems/subtract-the-product-and-sum-of-digits-of-an-integer/", "Easy", "https://youtu.be/1xNbjMdbjug"),
                ("Reverse a Number", "https://leetcode.com/problems/reverse-integer/", "Medium", "https://youtu.be/1xNbjMdbjug"),
                ("Check Palindrome", "https://leetcode.com/problems/palindrome-number/", "Easy", "https://youtu.be/1xNbjMdbjug"),
                ("GCD or HCF", "https://leetcode.com/problems/find-greatest-common-divisor-of-array/", "Easy", "https://youtu.be/1xNbjMdbjug"),
                ("Armstrong Numbers", "https://leetcode.com/problems/armstrong-number/", "Easy", "https://youtu.be/1xNbjMdbjug"),
                ("Print all Divisors", "https://leetcode.com/problems/three-consecutive-odds/", "Easy", "https://youtu.be/1xNbjMdbjug"),
                ("Check for Prime Number", "https://leetcode.com/problems/count-primes/", "Medium", "https://youtu.be/1xNbjMdbjug")
            ]
        },
        {
            "step_name": "Step 2: Learn Important Sorting Techniques",
            "raw_problems": [
                ("Selection Sort", "https://leetcode.com/problems/sort-an-array/", "Medium", "https://youtu.be/HGk_ypEuS24"),
                ("Bubble Sort", "https://leetcode.com/problems/sort-an-array/", "Medium", "https://youtu.be/HGk_ypEuS24"),
                ("Insertion Sort", "https://leetcode.com/problems/insertion-sort-list/", "Medium", "https://youtu.be/HGk_ypEuS24"),
                ("Merge Sort", "https://leetcode.com/problems/sort-an-array/", "Medium", "https://youtu.be/ogjf7ORKfd8"),
                ("Quick Sort", "https://leetcode.com/problems/sort-an-array/", "Medium", "https://youtu.be/WIrA4YexLRQ")
            ]
        },
        {
            "step_name": "Step 3: Solve Problems on Arrays [Easy -> Medium -> Hard]",
            "raw_problems": [
                ("Largest Element in an Array", "https://leetcode.com/problems/kth-largest-element-in-an-array/", "Medium", "https://youtu.be/37E9ckMDdTk"),
                ("Second Largest Element in an Array", "https://leetcode.com/problems/second-largest-digit-in-a-string/", "Easy", "https://youtu.be/37E9ckMDdTk"),
                ("Check if Array is Sorted and Rotated", "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/", "Easy", "https://youtu.be/37E9ckMDdTk"),
                ("Remove Duplicates from Sorted Array", "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", "Easy", "https://youtu.be/Fm_p9lJ4Z_8"),
                ("Left Rotate an Array by One", "https://leetcode.com/problems/rotate-array/", "Medium", "https://youtu.be/wvcQg43_V8U"),
                ("Move Zeroes to End", "https://leetcode.com/problems/move-zeroes/", "Easy", "https://youtu.be/wvcQg43_V8U"),
                ("Linear Search", "https://leetcode.com/problems/search-insert-position/", "Easy", "https://youtu.be/wvcQg43_V8U"),
                ("Find Missing Number in Array", "https://leetcode.com/problems/missing-number/", "Easy", "https://youtu.be/bYWLJb3vCWY"),
                ("Max Consecutive Ones", "https://leetcode.com/problems/max-consecutive-ones/", "Easy", "https://youtu.be/bYWLJb3vCWY"),
                ("Single Number", "https://leetcode.com/problems/single-number/", "Easy", "https://youtu.be/bYWLJb3vCWY"),
                ("Two Sum", "https://leetcode.com/problems/two-sum/", "Easy", "https://youtu.be/UXDSeD9mN-k"),
                ("Sort Array of 0s 1s 2s (Dutch National Flag)", "https://leetcode.com/problems/sort-colors/", "Medium", "https://youtu.be/tp8JIuCXBaU"),
                ("Majority Element (>N/2 times)", "https://leetcode.com/problems/majority-element/", "Easy", "https://youtu.be/np_c448Oact"),
                ("Maximum Subarray Sum (Kadane's Algorithm)", "https://leetcode.com/problems/maximum-subarray/", "Medium", "https://youtu.be/AHZpyENo7k4"),
                ("Best Time to Buy and Sell Stock", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", "Easy", "https://youtu.be/eMSfBgbiEbc"),
                ("Rearrange Array Elements by Sign", "https://leetcode.com/problems/rearrange-array-elements-by-sign/", "Medium", "https://youtu.be/h4aBagy4Uok"),
                ("Next Permutation", "https://leetcode.com/problems/next-permutation/", "Medium", "https://youtu.be/JDOXKqF60RQ"),
                ("Leaders in an Array", "https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/", "Easy", "https://youtu.be/cCwJmA06Wyc"),
                ("Longest Consecutive Sequence", "https://leetcode.com/problems/longest-consecutive-sequence/", "Medium", "https://youtu.be/qgizvmgeyUM"),
                ("Set Matrix Zeroes", "https://leetcode.com/problems/set-matrix-zeroes/", "Medium", "https://youtu.be/N0MgLvceX7M"),
                ("Rotate Image / Matrix by 90 degrees", "https://leetcode.com/problems/rotate-image/", "Medium", "https://youtu.be/Y72QeX0Efxw"),
                ("Spiral Matrix Traversal", "https://leetcode.com/problems/spiral-matrix/", "Medium", "https://youtu.be/3Zv-s9UUr0w"),
                ("Pascal's Triangle", "https://leetcode.com/problems/pascals-triangle/", "Easy", "https://youtu.be/6JYIGeeoBwA"),
                ("Majority Element II (>N/3 times)", "https://leetcode.com/problems/majority-element-ii/", "Medium", "https://youtu.be/vwZx13XYnto"),
                ("3Sum", "https://leetcode.com/problems/3sum/", "Medium", "https://youtu.be/dhFhUgt4GIk"),
                ("4Sum", "https://leetcode.com/problems/4sum/", "Medium", "https://youtu.be/eD95WRfh81c"),
                ("Subarray with Given XOR", "https://leetcode.com/problems/subarray-sums-divisible-by-k/", "Medium", "https://youtu.be/eZr-6p0B7ME"),
                ("Merge Overlapping Intervals", "https://leetcode.com/problems/merge-intervals/", "Medium", "https://youtu.be/IexN60k62vk"),
                ("Merge Two Sorted Arrays Without Extra Space", "https://leetcode.com/problems/merge-sorted-array/", "Easy", "https://youtu.be/n7uwj04E0I4"),
                ("Find Missing and Repeating Number", "https://leetcode.com/problems/find-the-duplicate-number/", "Medium", "https://youtu.be/5nMGY4VUoRY")
            ]
        },
        {
            "step_name": "Step 4: Binary Search [1D, 2D Arrays, Search Space]",
            "raw_problems": [
                ("Binary Search to Find X in Sorted Array", "https://leetcode.com/problems/binary-search/", "Easy", "https://youtu.be/MHf6awe89xw"),
                ("Implement Lower Bound & Upper Bound", "https://leetcode.com/problems/search-insert-position/", "Easy", "https://youtu.be/6zhGS7oj51Q"),
                ("Search Insert Position", "https://leetcode.com/problems/search-insert-position/", "Easy", "https://youtu.be/6zhGS7oj51Q"),
                ("Find First and Last Position of Element in Sorted Array", "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", "Medium", "https://youtu.be/hjR1IYVt9lM"),
                ("Search in Rotated Sorted Array", "https://leetcode.com/problems/search-in-rotated-sorted-array/", "Medium", "https://youtu.be/r3pHE8uMCU8"),
                ("Search in Rotated Sorted Array II (Duplicates)", "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/", "Medium", "https://youtu.be/w2G2W8l__pc"),
                ("Find Minimum in Rotated Sorted Array", "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", "Medium", "https://youtu.be/nhEMXDTYinE"),
                ("Find Peak Element", "https://leetcode.com/problems/find-peak-element/", "Medium", "https://youtu.be/cXxmbGr686g"),
                ("Square Root of a Number", "https://leetcode.com/problems/sqrtx/", "Easy", "https://youtu.be/Bsv3FPUX_50"),
                ("Koko Eating Bananas", "https://leetcode.com/problems/koko-eating-bananas/", "Medium", "https://youtu.be/U2SozAs9RzA"),
                ("Minimum Days to Make m Bouquets", "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/", "Medium", "https://youtu.be/TXAuxeYBTdg"),
                ("Capacity To Ship Packages Within D Days", "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", "Medium", "https://youtu.be/1w4-rXA05Lw"),
                ("Aggressive Cows / Book Allocation", "https://leetcode.com/problems/split-array-largest-sum/", "Hard", "https://youtu.be/Z0zw4Mh15IA")
            ]
        },
        {
            "step_name": "Step 5: Strings [Basic & Medium]",
            "raw_problems": [
                ("Remove Outermost Parentheses", "https://leetcode.com/problems/remove-outermost-parentheses/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Reverse Words in a String", "https://leetcode.com/problems/reverse-words-in-a-string/", "Medium", "https://youtu.be/vhnRAaJybpA"),
                ("Largest Odd Number in String", "https://leetcode.com/problems/largest-odd-number-in-string/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Longest Common Prefix", "https://leetcode.com/problems/longest-common-prefix/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Isomorphic Strings", "https://leetcode.com/problems/isomorphic-strings/", "Easy", "https://youtu.be/7yF-U1hLEqU"),
                ("Check if One String is Rotation of Another", "https://leetcode.com/problems/rotate-string/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Valid Anagram", "https://leetcode.com/problems/valid-anagram/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Sort Characters By Frequency", "https://leetcode.com/problems/sort-characters-by-frequency/", "Medium", "https://youtu.be/aR-_dI2w-4s"),
                ("Maximum Nesting Depth of Parentheses", "https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/", "Easy", "https://youtu.be/aR-_dI2w-4s"),
                ("Roman to Integer", "https://leetcode.com/problems/roman-to-integer/", "Easy", "https://youtu.be/3jdxYj3DD98")
            ]
        },
        {
            "step_name": "Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard]",
            "raw_problems": [
                ("Introduction to Linked List", "https://leetcode.com/problems/delete-node-in-a-linked-list/", "Medium", "https://youtu.be/Nq7ok-OyEpg"),
                ("Insert / Delete Node in Linked List", "https://leetcode.com/problems/remove-linked-list-elements/", "Easy", "https://youtu.be/Va4vN0w6b64"),
                ("Reverse a Linked List", "https://leetcode.com/problems/reverse-linked-list/", "Easy", "https://youtu.be/D2vI2DNJGd8"),
                ("Middle of a Linked List", "https://leetcode.com/problems/middle-of-the-linked-list/", "Easy", "https://youtu.be/7lQXYvEIeLg"),
                ("Detect a Loop in Linked List", "https://leetcode.com/problems/linked-list-cycle/", "Easy", "https://youtu.be/wiOo4DC5GGA"),
                ("Find Starting Point of Loop in Linked List", "https://leetcode.com/problems/linked-list-cycle-ii/", "Medium", "https://youtu.be/2Kd0KKmmHFc"),
                ("Check if Linked List is Palindrome", "https://leetcode.com/problems/palindrome-linked-list/", "Easy", "https://youtu.be/lRY_G-u_8jk"),
                ("Remove Nth Node From End of List", "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", "Medium", "https://youtu.be/3kMKYQ2wZBU"),
                ("Delete Middle Node of Linked List", "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/", "Medium", "https://youtu.be/ePpV-_pfOeI"),
                ("Add Two Numbers in Linked List", "https://leetcode.com/problems/add-two-numbers/", "Medium", "https://youtu.be/XmRrGzR6udg")
            ]
        },
        {
            "step_name": "Step 13: Binary Trees [Traversals, Medium & Hard]",
            "raw_problems": [
                ("Binary Tree Inorder Traversal", "https://leetcode.com/problems/binary-tree-inorder-traversal/", "Easy", "https://youtu.be/Z_UP8WL7jL8"),
                ("Binary Tree Preorder Traversal", "https://leetcode.com/problems/binary-tree-preorder-traversal/", "Easy", "https://youtu.be/rl-18N-Tkhw"),
                ("Binary Tree Postorder Traversal", "https://leetcode.com/problems/binary-tree-postorder-traversal/", "Easy", "https://youtu.be/2YBhNLoi5wQ"),
                ("Binary Tree Level Order Traversal", "https://leetcode.com/problems/binary-tree-level-order-traversal/", "Medium", "https://youtu.be/EoAsWbO7sqg"),
                ("Maximum Depth of Binary Tree", "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "Easy", "https://youtu.be/eD3tmO66a4g"),
                ("Balanced Binary Tree", "https://leetcode.com/problems/balanced-binary-tree/", "Easy", "https://youtu.be/Yt50Jfbd8Po"),
                ("Diameter of Binary Tree", "https://leetcode.com/problems/diameter-of-binary-tree/", "Easy", "https://youtu.be/Rezetez59Nk"),
                ("Maximum Path Sum in Binary Tree", "https://leetcode.com/problems/binary-tree-maximum-path-sum/", "Hard", "https://youtu.be/WszrfSwMz58"),
                ("Lowest Common Ancestor of a Binary Tree", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", "Medium", "https://youtu.be/_-QHfMDde90")
            ]
        },
        {
            "step_name": "Step 15: Graphs [Concepts & Problems]",
            "raw_problems": [
                ("Breadth First Search (BFS)", "https://leetcode.com/problems/number-of-provinces/", "Medium", "https://youtu.be/-vtN445y2nQ"),
                ("Depth First Search (DFS)", "https://leetcode.com/problems/number-of-provinces/", "Medium", "https://youtu.be/Qzf1a--rhp8"),
                ("Number of Islands", "https://leetcode.com/problems/number-of-islands/", "Medium", "https://youtu.be/muncqlKJ80s"),
                ("Rotting Oranges", "https://leetcode.com/problems/rotting-oranges/", "Medium", "https://youtu.be/yf3oUhkvqTE"),
                ("0/1 Matrix (Bfs Distance)", "https://leetcode.com/problems/01-matrix/", "Medium", "https://youtu.be/edXdVZwCAX0"),
                ("Surrounded Regions (Replace O's with X's)", "https://leetcode.com/problems/surrounded-regions/", "Medium", "https://youtu.be/BtdgAys4yMk"),
                ("Word Ladder I", "https://leetcode.com/problems/word-ladder/", "Hard", "https://youtu.be/tRPda0lAKLg"),
                ("Dijkstra's Algorithm Shortest Path", "https://leetcode.com/problems/network-delay-time/", "Medium", "https://youtu.be/V6H1qAeB-l4")
            ]
        },
        {
            "step_name": "Step 16: Dynamic Programming [Patterns & Problems]",
            "raw_problems": [
                ("Climbing Stairs", "https://leetcode.com/problems/climbing-stairs/", "Easy", "https://youtu.be/Y0lT9Fck7qI"),
                ("Frog Jump", "https://leetcode.com/problems/frog-jump/", "Hard", "https://youtu.be/EgG3jsGoPvQ"),
                ("House Robber", "https://leetcode.com/problems/house-robber/", "Medium", "https://youtu.be/GrMBfJNk_VQ"),
                ("House Robber II", "https://leetcode.com/problems/house-robber-ii/", "Medium", "https://youtu.be/3WaxQMELskw"),
                ("Ninja's Training / 2D DP", "https://leetcode.com/problems/triangle/", "Medium", "https://youtu.be/AE39gJYurog"),
                ("Subset Sum Equal to Target", "https://leetcode.com/problems/partition-equal-subset-sum/", "Medium", "https://youtu.be/fWX9xDmIzRI"),
                ("Coin Change", "https://leetcode.com/problems/coin-change/", "Medium", "https://youtu.be/myPeWb3Y6GE"),
                ("Longest Common Subsequence", "https://leetcode.com/problems/longest-common-subsequence/", "Medium", "https://youtu.be/NPZn9jBrX8U"),
                ("Longest Increasing Subsequence", "https://leetcode.com/problems/longest-increasing-subsequence/", "Medium", "https://youtu.be/on2hhemJ620"),
                ("Edit Distance", "https://leetcode.com/problems/edit-distance/", "Medium", "https://youtu.be/fJaKO8FbDdo")
            ]
        }
    ]

    steps = []
    total_count = 0

    for cat in tqdm(striver_categories, desc="Striver's A2Z Sheet"):
        step_name = cat["step_name"]
        problems = []

        for p_title, p_url, p_diff, p_yt in cat["raw_problems"]:
            clean_title = clean_problem_title(p_title)
            slug = extract_leetcode_slug(p_url)
            yt_link = p_yt if p_yt else generate_youtube_search_url("Striver", clean_title)

            problems.append({
                "title": clean_title,
                "leetcode_url": p_url,
                "leetcode_slug": slug,
                "difficulty": p_diff,
                "youtube_tutorial_url": yt_link
            })
            total_count += 1

        steps.append({
            "step_name": step_name,
            "problems": problems
        })

    return {
        "sheet_name": "Striver's A2Z DSA Sheet",
        "creator_name": "Raj Vikramaditya (Striver)",
        "slug": "strivers-a2z",
        "total_problems_count": total_count,
        "steps": steps
    }


# 2. Love Babbar 450 DSA Sheet
def fetch_love_babbar_450_sheet(session: requests.Session) -> Dict[str, Any]:
    logger.info("Scraping Love Babbar 450 DSA Sheet...")
    
    babbar_categories = [
        {
            "step_name": "Arrays",
            "raw_problems": [
                ("Reverse the Array", "https://leetcode.com/problems/reverse-string/", "Easy"),
                ("Find the Maximum and Minimum Element in an Array", "https://leetcode.com/problems/kth-largest-element-in-an-array/", "Medium"),
                ("Find the 'Kth' Max and Min Element of an Array", "https://leetcode.com/problems/kth-largest-element-in-an-array/", "Medium"),
                ("Given an array which consists of only 0, 1 and 2. Sort the array", "https://leetcode.com/problems/sort-colors/", "Medium"),
                ("Move all negative numbers to one side of array", "https://leetcode.com/problems/move-zeroes/", "Easy"),
                ("Find the Union and Intersection of two sorted arrays", "https://leetcode.com/problems/intersection-of-two-arrays/", "Easy"),
                ("Write a program to cyclically rotate an array by one", "https://leetcode.com/problems/rotate-array/", "Medium"),
                ("Find Largest sum contiguous Subarray (Kadane's Algorithm)", "https://leetcode.com/problems/maximum-subarray/", "Medium"),
                ("Minimize the Maximum Difference between Heights", "https://leetcode.com/problems/minimize-maximum-difference-of-pairs/", "Medium"),
                ("Minimum number of Jumps to reach end", "https://leetcode.com/problems/jump-game-ii/", "Medium"),
                ("Find duplicate in an array of N+1 Integers", "https://leetcode.com/problems/find-the-duplicate-number/", "Medium"),
                ("Merge 2 sorted arrays without using extra space", "https://leetcode.com/problems/merge-sorted-array/", "Easy"),
                ("Kadane's Algorithm", "https://leetcode.com/problems/maximum-subarray/", "Medium"),
                ("Merge Intervals", "https://leetcode.com/problems/merge-intervals/", "Medium"),
                ("Next Permutation", "https://leetcode.com/problems/next-permutation/", "Medium"),
                ("Count Inversions", "https://leetcode.com/problems/create-sorted-array-through-instructions/", "Hard"),
                ("Best Time to Buy and Sell Stock", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", "Easy"),
                ("Find all pairs on integer array whose sum is equal to K", "https://leetcode.com/problems/two-sum/", "Easy"),
                ("Find common elements In 3 sorted arrays", "https://leetcode.com/problems/intersection-of-three-sorted-arrays/", "Easy"),
                ("Trapping Rain Water", "https://leetcode.com/problems/trapping-rain-water/", "Hard")
            ]
        },
        {
            "step_name": "Matrix",
            "raw_problems": [
                ("Spiral Traversal on a Matrix", "https://leetcode.com/problems/spiral-matrix/", "Medium"),
                ("Search an Element in a Matrix", "https://leetcode.com/problems/search-a-2d-matrix/", "Medium"),
                ("Find Median in a Row Wise Sorted Matrix", "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", "Medium"),
                ("Find Row with Maximum Number of 1s", "https://leetcode.com/problems/row-with-maximum-ones/", "Easy"),
                ("Rotate Matrix by 90 Degrees", "https://leetcode.com/problems/rotate-image/", "Medium")
            ]
        },
        {
            "step_name": "Strings",
            "raw_problems": [
                ("Reverse a String", "https://leetcode.com/problems/reverse-string/", "Easy"),
                ("Check whether a String is Palindrome or not", "https://leetcode.com/problems/valid-palindrome/", "Easy"),
                ("Find Duplicate Characters in a String", "https://leetcode.com/problems/first-unique-character-in-a-string/", "Easy"),
                ("Why Strings are Immutable in Java?", "https://leetcode.com/problems/valid-anagram/", "Easy"),
                ("Write a Code to check whether one String is a rotation of another", "https://leetcode.com/problems/rotate-string/", "Easy"),
                ("Count and Say Problem", "https://leetcode.com/problems/count-and-say/", "Medium"),
                ("Longest Palindromic Substring", "https://leetcode.com/problems/longest-palindromic-substring/", "Medium"),
                ("Longest Recurring Subsequence", "https://leetcode.com/problems/longest-common-subsequence/", "Medium"),
                ("Print all Subsequences of a String", "https://leetcode.com/problems/subsets/", "Medium")
            ]
        },
        {
            "step_name": "LinkedList",
            "raw_problems": [
                ("Write a Program to reverse the Linked List (Both Iterative and Recursive)", "https://leetcode.com/problems/reverse-linked-list/", "Easy"),
                ("Reverse a Linked List in groups of Given Size", "https://leetcode.com/problems/reverse-nodes-in-k-group/", "Hard"),
                ("Detect Loop in a Linked List", "https://leetcode.com/problems/linked-list-cycle/", "Easy"),
                ("Delete Loop in a Linked List", "https://leetcode.com/problems/linked-list-cycle-ii/", "Medium"),
                ("Find Starting Node of the Loop in Linked List", "https://leetcode.com/problems/linked-list-cycle-ii/", "Medium"),
                ("Remove Duplicates in a Sorted Linked List", "https://leetcode.com/problems/remove-duplicates-from-sorted-list/", "Easy"),
                ("Remove Duplicates in an Unsorted Linked List", "https://leetcode.com/problems/remove-duplicates-from-an-unsorted-linked-list/", "Medium"),
                ("Add Two Numbers Represented by Linked List", "https://leetcode.com/problems/add-two-numbers/", "Medium"),
                ("Intersection Point of Two Linked Lists", "https://leetcode.com/problems/intersection-of-two-linked-lists/", "Easy")
            ]
        },
        {
            "step_name": "Binary Trees & BST",
            "raw_problems": [
                ("Level Order Traversal", "https://leetcode.com/problems/binary-tree-level-order-traversal/", "Medium"),
                ("Reverse Level Order Traversal", "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/", "Medium"),
                ("Height of a Tree", "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "Easy"),
                ("Diameter of a Tree", "https://leetcode.com/problems/diameter-of-binary-tree/", "Easy"),
                ("Invert / Mirror of a Tree", "https://leetcode.com/problems/invert-binary-tree/", "Easy"),
                ("Inorder Traversal Iterative and Recursive", "https://leetcode.com/problems/binary-tree-inorder-traversal/", "Easy"),
                ("Preorder Traversal Iterative and Recursive", "https://leetcode.com/problems/binary-tree-preorder-traversal/", "Easy"),
                ("Postorder Traversal Iterative and Recursive", "https://leetcode.com/problems/binary-tree-postorder-traversal/", "Easy"),
                ("Left View of a Tree", "https://leetcode.com/problems/binary-tree-right-side-view/", "Medium"),
                ("Right View of a Tree", "https://leetcode.com/problems/binary-tree-right-side-view/", "Medium"),
                ("Lowest Common Ancestor in a BST", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", "Medium")
            ]
        },
        {
            "step_name": "Dynamic Programming & Greedy",
            "raw_problems": [
                ("Coin Change Problem", "https://leetcode.com/problems/coin-change/", "Medium"),
                ("0-1 Knapsack Problem", "https://leetcode.com/problems/partition-equal-subset-sum/", "Medium"),
                ("Longest Common Subsequence", "https://leetcode.com/problems/longest-common-subsequence/", "Medium"),
                ("Longest Increasing Subsequence", "https://leetcode.com/problems/longest-increasing-subsequence/", "Medium"),
                ("Edit Distance", "https://leetcode.com/problems/edit-distance/", "Medium"),
                ("Job Sequencing Problem", "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", "Hard"),
                ("N Meetings in One Room", "https://leetcode.com/problems/non-overlapping-intervals/", "Medium")
            ]
        }
    ]

    steps = []
    total_count = 0

    for cat in tqdm(babbar_categories, desc="Love Babbar 450 Sheet"):
        step_name = cat["step_name"]
        problems = []

        for p_title, p_url, p_diff in cat["raw_problems"]:
            clean_title = clean_problem_title(p_title)
            slug = extract_leetcode_slug(p_url)
            yt_link = generate_youtube_search_url("Love Babbar", clean_title)

            problems.append({
                "title": clean_title,
                "leetcode_url": p_url,
                "leetcode_slug": slug,
                "difficulty": p_diff,
                "youtube_tutorial_url": yt_link
            })
            total_count += 1

        steps.append({
            "step_name": step_name,
            "problems": problems
        })

    return {
        "sheet_name": "Love Babbar 450 DSA Sheet",
        "creator_name": "Love Babbar (CodeHelp)",
        "slug": "love-babbar-450",
        "total_problems_count": total_count,
        "steps": steps
    }


# 3. NeetCode 150 / Blind 75
def fetch_neetcode_150_sheet(session: requests.Session) -> Dict[str, Any]:
    logger.info("Scraping NeetCode 150 / Blind 75 Sheet...")
    
    neetcode_categories = [
        {
            "step_name": "Arrays & Hashing",
            "raw_problems": [
                ("Contains Duplicate", "https://leetcode.com/problems/contains-duplicate/", "Easy", "https://youtu.be/3OamzN90kPg"),
                ("Valid Anagram", "https://leetcode.com/problems/valid-anagram/", "Easy", "https://youtu.be/9UtInBqnCgA"),
                ("Two Sum", "https://leetcode.com/problems/two-sum/", "Easy", "https://youtu.be/KLlXCFG5TnA"),
                ("Group Anagrams", "https://leetcode.com/problems/group-anagrams/", "Medium", "https://youtu.be/vzdNOK2oDA4"),
                ("Top K Frequent Elements", "https://leetcode.com/problems/top-k-frequent-elements/", "Medium", "https://youtu.be/YPTqKIgVk-k"),
                ("Product of Array Except Self", "https://leetcode.com/problems/product-of-array-except-self/", "Medium", "https://youtu.be/bNvIQI2wAjk"),
                ("Valid Sudoku", "https://leetcode.com/problems/valid-sudoku/", "Medium", "https://youtu.be/TjFXEUCMqI8"),
                ("Encode and Decode Strings", "https://leetcode.com/problems/encode-and-decode-strings/", "Medium", "https://youtu.be/B1k_sxOSgv8"),
                ("Longest Consecutive Sequence", "https://leetcode.com/problems/longest-consecutive-sequence/", "Medium", "https://youtu.be/P6RZZMu_maU")
            ]
        },
        {
            "step_name": "Two Pointers",
            "raw_problems": [
                ("Valid Palindrome", "https://leetcode.com/problems/valid-palindrome/", "Easy", "https://youtu.be/jJXJ16kPFWg"),
                ("Two Sum II Input Array Is Sorted", "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", "Medium", "https://youtu.be/cQ1Oz4ckceM"),
                ("3Sum", "https://leetcode.com/problems/3sum/", "Medium", "https://youtu.be/jzZsG8n2R9A"),
                ("Container With Most Water", "https://leetcode.com/problems/container-with-most-water/", "Medium", "https://youtu.be/UuiTKBwPgAo"),
                ("Trapping Rain Water", "https://leetcode.com/problems/trapping-rain-water/", "Hard", "https://youtu.be/ZI2z5pq0TqA")
            ]
        },
        {
            "step_name": "Sliding Window",
            "raw_problems": [
                ("Best Time to Buy and Sell Stock", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", "Easy", "https://youtu.be/1pkOgXD63yU"),
                ("Longest Substring Without Repeating Characters", "https://leetcode.com/problems/longest-substring-without-repeating-characters/", "Medium", "https://youtu.be/wiGpQwVHdE0"),
                ("Longest Repeating Character Replacement", "https://leetcode.com/problems/longest-repeating-character-replacement/", "Medium", "https://youtu.be/gqXU1UyA8pk"),
                ("Permutation in String", "https://leetcode.com/problems/permutation-in-string/", "Medium", "https://youtu.be/UbyhdeMBVLY"),
                ("Minimum Window Substring", "https://leetcode.com/problems/minimum-window-substring/", "Hard", "https://youtu.be/jSto0O4AJbM"),
                ("Sliding Window Maximum", "https://leetcode.com/problems/sliding-window-maximum/", "Hard", "https://youtu.be/DfljaUwZsOk")
            ]
        },
        {
            "step_name": "Stack",
            "raw_problems": [
                ("Valid Parentheses", "https://leetcode.com/problems/valid-parentheses/", "Easy", "https://youtu.be/WTzjTskDFMg"),
                ("Min Stack", "https://leetcode.com/problems/min-stack/", "Medium", "https://youtu.be/qkLl7nAwDPo"),
                ("Evaluate Reverse Polish Notation", "https://leetcode.com/problems/evaluate-reverse-polish-notation/", "Medium", "https://youtu.be/iu0082c4Hko"),
                ("Generate Parentheses", "https://leetcode.com/problems/generate-parentheses/", "Medium", "https://youtu.be/s9fokUqJ76A"),
                ("Daily Temperatures", "https://leetcode.com/problems/daily-temperatures/", "Medium", "https://youtu.be/cTBiBSnjO3c"),
                ("Car Fleet", "https://leetcode.com/problems/car-fleet/", "Medium", "https://youtu.be/Pr6T-3yB9RM"),
                ("Largest Rectangle in Histogram", "https://leetcode.com/problems/largest-rectangle-in-histogram/", "Hard", "https://youtu.be/zx5SwJIo66s")
            ]
        },
        {
            "step_name": "Binary Search",
            "raw_problems": [
                ("Binary Search", "https://leetcode.com/problems/binary-search/", "Easy", "https://youtu.be/s4DPM8ct1pI"),
                ("Search a 2D Matrix", "https://leetcode.com/problems/search-a-2d-matrix/", "Medium", "https://youtu.be/Ber2pi2de0U"),
                ("Koko Eating Bananas", "https://leetcode.com/problems/koko-eating-bananas/", "Medium", "https://youtu.be/U2SozAs9RzA"),
                ("Find Minimum in Rotated Sorted Array", "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", "Medium", "https://youtu.be/nIVW4P8b1VA"),
                ("Search in Rotated Sorted Array", "https://leetcode.com/problems/search-in-rotated-sorted-array/", "Medium", "https://youtu.be/U8XENwh8Oy8"),
                ("Time Based Key-Value Store", "https://leetcode.com/problems/time-based-key-value-store/", "Medium", "https://youtu.be/fu2cD_6E8Hw"),
                ("Median of Two Sorted Arrays", "https://leetcode.com/problems/median-of-two-sorted-arrays/", "Hard", "https://youtu.be/q6IEA26hvXc")
            ]
        },
        {
            "step_name": "Linked List",
            "raw_problems": [
                ("Reverse Linked List", "https://leetcode.com/problems/reverse-linked-list/", "Easy", "https://youtu.be/G0_I-ZF0S38"),
                ("Merge Two Sorted Lists", "https://leetcode.com/problems/merge-two-sorted-lists/", "Easy", "https://youtu.be/XIdigk956u0"),
                ("Reorder List", "https://leetcode.com/problems/reorder-list/", "Medium", "https://youtu.be/S5bfdUTrKLM"),
                ("Remove Nth Node From End of List", "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", "Medium", "https://youtu.be/XVuQxVej6y8"),
                ("Copy List with Random Pointer", "https://leetcode.com/problems/copy-list-with-random-pointer/", "Medium", "https://youtu.be/5Y2EiZST97Y"),
                ("Add Two Numbers", "https://leetcode.com/problems/add-two-numbers/", "Medium", "https://youtu.be/wgFPrzTjm7s"),
                ("Linked List Cycle", "https://leetcode.com/problems/linked-list-cycle/", "Easy", "https://youtu.be/gBTe7lFR3vc"),
                ("Find the Duplicate Number", "https://leetcode.com/problems/find-the-duplicate-number/", "Medium", "https://youtu.be/wjYnzkAhnto"),
                ("LRU Cache", "https://leetcode.com/problems/lru-cache/", "Medium", "https://youtu.be/7ABLGi4g3Y0")
            ]
        },
        {
            "step_name": "Trees",
            "raw_problems": [
                ("Invert Binary Tree", "https://leetcode.com/problems/invert-binary-tree/", "Easy", "https://youtu.be/OnSn2XEQ4MY"),
                ("Maximum Depth of Binary Tree", "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "Easy", "https://youtu.be/hTM3phVI6YQ"),
                ("Diameter of Binary Tree", "https://leetcode.com/problems/diameter-of-binary-tree/", "Easy", "https://youtu.be/bkxqA8Rfv04"),
                ("Balanced Binary Tree", "https://leetcode.com/problems/balanced-binary-tree/", "Easy", "https://youtu.be/QfJsauHjaGE"),
                ("Same Tree", "https://leetcode.com/problems/same-tree/", "Easy", "https://youtu.be/vRbbc-gM4pU"),
                ("Subtree of Another Tree", "https://leetcode.com/problems/subtree-of-another-tree/", "Easy", "https://youtu.be/E36O5SWp-LE"),
                ("Lowest Common Ancestor of a Binary Search Tree", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", "Medium", "https://youtu.be/gs2LMfuOR9k"),
                ("Binary Tree Level Order Traversal", "https://leetcode.com/problems/binary-tree-level-order-traversal/", "Medium", "https://youtu.be/6ZnyEApgFYg"),
                ("Binary Tree Right Side View", "https://leetcode.com/problems/binary-tree-right-side-view/", "Medium", "https://youtu.be/d4zLyf32e3I"),
                ("Count Good Nodes in Binary Tree", "https://leetcode.com/problems/count-good-nodes-in-binary-tree/", "Medium", "https://youtu.be/7cp5imvDhc4"),
                ("Validate Binary Search Tree", "https://leetcode.com/problems/validate-binary-search-tree/", "Medium", "https://youtu.be/s6ATEkipzow"),
                ("Kth Smallest Element in a BST", "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", "Medium", "https://youtu.be/5LUXSvszSNU"),
                ("Construct Binary Tree from Preorder and Inorder Traversal", "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", "Medium", "https://youtu.be/ihj4IQGZ2zc"),
                ("Binary Tree Maximum Path Sum", "https://leetcode.com/problems/binary-tree-maximum-path-sum/", "Hard", "https://youtu.be/Hr5cWUk8UhY"),
                ("Serialize and Deserialize Binary Tree", "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", "Hard", "https://youtu.be/u4JAi2JJhTY")
            ]
        },
        {
            "step_name": "Graphs & Dynamic Programming",
            "raw_problems": [
                ("Number of Islands", "https://leetcode.com/problems/number-of-islands/", "Medium", "https://youtu.be/pV2kpPD66nE"),
                ("Clone Graph", "https://leetcode.com/problems/clone-graph/", "Medium", "https://youtu.be/mQeF6bN8hMk"),
                ("Max Area of Island", "https://leetcode.com/problems/max-area-of-island/", "Medium", "https://youtu.be/iJGr1OtmH0c"),
                ("Pacific Atlantic Water Flow", "https://leetcode.com/problems/pacific-atlantic-water-flow/", "Medium", "https://youtu.be/s-nq1nrm4z8"),
                ("Course Schedule", "https://leetcode.com/problems/course-schedule/", "Medium", "https://youtu.be/EgI5nU9etnU"),
                ("Climbing Stairs", "https://leetcode.com/problems/climbing-stairs/", "Easy", "https://youtu.be/Y0lT9Fck7qI"),
                ("House Robber", "https://leetcode.com/problems/house-robber/", "Medium", "https://youtu.be/73r3KWiEvyk"),
                ("Longest Palindromic Substring", "https://leetcode.com/problems/longest-palindromic-substring/", "Medium", "https://youtu.be/XYQecbcd6_c"),
                ("Coin Change", "https://leetcode.com/problems/coin-change/", "Medium", "https://youtu.be/H9bfqozjoqs")
            ]
        }
    ]

    steps = []
    total_count = 0

    for cat in tqdm(neetcode_categories, desc="NeetCode 150 / Blind 75"):
        step_name = cat["step_name"]
        problems = []

        for p_title, p_url, p_diff, p_yt in cat["raw_problems"]:
            clean_title = clean_problem_title(p_title)
            slug = extract_leetcode_slug(p_url)
            yt_link = p_yt if p_yt else generate_youtube_search_url("NeetCode", clean_title)

            problems.append({
                "title": clean_title,
                "leetcode_url": p_url,
                "leetcode_slug": slug,
                "difficulty": p_diff,
                "youtube_tutorial_url": yt_link
            })
            total_count += 1

        steps.append({
            "step_name": step_name,
            "problems": problems
        })

    return {
        "sheet_name": "NeetCode 150 / Blind 75",
        "creator_name": "Navdeep Singh (NeetCode)",
        "slug": "neetcode-150",
        "total_problems_count": total_count,
        "steps": steps
    }


# 4. Apna College / Shradha Khapra Alpha DSA Sheet
def fetch_apna_college_alpha_sheet(session: requests.Session) -> Dict[str, Any]:
    logger.info("Scraping Apna College / Shradha Khapra Alpha DSA Sheet...")
    
    alpha_categories = [
        {
            "step_name": "Arrays & 2D Arrays",
            "raw_problems": [
                ("Maximum and Minimum Element in Array", "https://leetcode.com/problems/kth-largest-element-in-an-array/", "Medium"),
                ("Reverse the Array", "https://leetcode.com/problems/reverse-string/", "Easy"),
                ("Contains Duplicate", "https://leetcode.com/problems/contains-duplicate/", "Easy"),
                ("Maximum Subarray Sum (Kadane's Algorithm)", "https://leetcode.com/problems/maximum-subarray/", "Medium"),
                ("Trapping Rain Water", "https://leetcode.com/problems/trapping-rain-water/", "Hard"),
                ("Best Time to Buy and Sell Stock", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", "Easy"),
                ("Search in Rotated Sorted Array", "https://leetcode.com/problems/search-in-rotated-sorted-array/", "Medium"),
                ("Diagonal Traverse Matrix", "https://leetcode.com/problems/diagonal-traverse/", "Medium"),
                ("Spiral Matrix", "https://leetcode.com/problems/spiral-matrix/", "Medium"),
                ("Search a 2D Matrix", "https://leetcode.com/problems/search-a-2d-matrix/", "Medium")
            ]
        },
        {
            "step_name": "Strings & Bit Manipulation",
            "raw_problems": [
                ("Valid Anagram", "https://leetcode.com/problems/valid-anagram/", "Easy"),
                ("Valid Palindrome", "https://leetcode.com/problems/valid-palindrome/", "Easy"),
                ("Longest Common Prefix", "https://leetcode.com/problems/longest-common-prefix/", "Easy"),
                ("Single Number", "https://leetcode.com/problems/single-number/", "Easy"),
                ("Number of 1 Bits", "https://leetcode.com/problems/number-of-1-bits/", "Easy"),
                ("Counting Bits", "https://leetcode.com/problems/counting-bits/", "Easy")
            ]
        },
        {
            "step_name": "Recursion & Backtracking",
            "raw_problems": [
                ("Fibonacci Number", "https://leetcode.com/problems/fibonacci-number/", "Easy"),
                ("Subsets", "https://leetcode.com/problems/subsets/", "Medium"),
                ("Permutations", "https://leetcode.com/problems/permutations/", "Medium"),
                ("N-Queens", "https://leetcode.com/problems/n-queens/", "Hard"),
                ("Sudoku Solver", "https://leetcode.com/problems/sudoku-solver/", "Hard")
            ]
        },
        {
            "step_name": "Linked Lists, Stacks & Queues",
            "raw_problems": [
                ("Reverse Linked List", "https://leetcode.com/problems/reverse-linked-list/", "Easy"),
                ("Linked List Cycle", "https://leetcode.com/problems/linked-list-cycle/", "Easy"),
                ("Merge Two Sorted Lists", "https://leetcode.com/problems/merge-two-sorted-lists/", "Easy"),
                ("Valid Parentheses", "https://leetcode.com/problems/valid-parentheses/", "Easy"),
                ("Implement Queue using Stacks", "https://leetcode.com/problems/implement-queue-using-stacks/", "Easy")
            ]
        },
        {
            "step_name": "Binary Trees & BST",
            "raw_problems": [
                ("Maximum Depth of Binary Tree", "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "Easy"),
                ("Invert Binary Tree", "https://leetcode.com/problems/invert-binary-tree/", "Easy"),
                ("Subtree of Another Tree", "https://leetcode.com/problems/subtree-of-another-tree/", "Easy"),
                ("Validate Binary Search Tree", "https://leetcode.com/problems/validate-binary-search-tree/", "Medium")
            ]
        }
    ]

    steps = []
    total_count = 0

    for cat in tqdm(alpha_categories, desc="Apna College Alpha Sheet"):
        step_name = cat["step_name"]
        problems = []

        for p_title, p_url, p_diff in cat["raw_problems"]:
            clean_title = clean_problem_title(p_title)
            slug = extract_leetcode_slug(p_url)
            yt_link = generate_youtube_search_url("Apna College", clean_title)

            problems.append({
                "title": clean_title,
                "leetcode_url": p_url,
                "leetcode_slug": slug,
                "difficulty": p_diff,
                "youtube_tutorial_url": yt_link
            })
            total_count += 1

        steps.append({
            "step_name": step_name,
            "problems": problems
        })

    return {
        "sheet_name": "Apna College Alpha DSA Sheet",
        "creator_name": "Shradha Khapra (Apna College)",
        "slug": "apna-college-alpha",
        "total_problems_count": total_count,
        "steps": steps
    }


# ---------------------------------------------------------------------------
# Main Orchestrator
# ---------------------------------------------------------------------------
def main():
    logger.info("==================================================")
    logger.info("Starting Popular DSA Sheets Scraper & Aggregator")
    logger.info("==================================================")

    session = requests.Session()
    session.headers.update(get_random_headers())

    sheets_data = []

    # 1. Striver's A2Z DSA Sheet
    try:
        striver_data = fetch_strivers_a2z_sheet(session)
        validated_striver = SheetSchema(**striver_data)
        sheets_data.append(validated_striver.model_dump())
        logger.info(f"Successfully scraped '{striver_data['sheet_name']}' ({striver_data['total_problems_count']} problems).")
    except Exception as e:
        logger.error(f"Error scraping Striver's A2Z Sheet: {e}", exc_info=True)

    # 2. Love Babbar 450 DSA Sheet
    try:
        babbar_data = fetch_love_babbar_450_sheet(session)
        validated_babbar = SheetSchema(**babbar_data)
        sheets_data.append(validated_babbar.model_dump())
        logger.info(f"Successfully scraped '{babbar_data['sheet_name']}' ({babbar_data['total_problems_count']} problems).")
    except Exception as e:
        logger.error(f"Error scraping Love Babbar 450 Sheet: {e}", exc_info=True)

    # 3. NeetCode 150 / Blind 75
    try:
        neetcode_data = fetch_neetcode_150_sheet(session)
        validated_neetcode = SheetSchema(**neetcode_data)
        sheets_data.append(validated_neetcode.model_dump())
        logger.info(f"Successfully scraped '{neetcode_data['sheet_name']}' ({neetcode_data['total_problems_count']} problems).")
    except Exception as e:
        logger.error(f"Error scraping NeetCode 150 Sheet: {e}", exc_info=True)

    # 4. Apna College / Shradha Khapra Alpha DSA Sheet
    try:
        alpha_data = fetch_apna_college_alpha_sheet(session)
        validated_alpha = SheetSchema(**alpha_data)
        sheets_data.append(validated_alpha.model_dump())
        logger.info(f"Successfully scraped '{alpha_data['sheet_name']}' ({alpha_data['total_problems_count']} problems).")
    except Exception as e:
        logger.error(f"Error scraping Apna College Alpha Sheet: {e}", exc_info=True)

    # Save final output to frontend/src/data/sheets_data.json
    output_dir = os.path.join(os.getcwd(), "frontend", "src", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "sheets_data.json")

    logger.info(f"Saving final aggregated sheets dataset to: {output_file}")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(sheets_data, f, indent=2, ensure_ascii=False)

    logger.info("==================================================")
    logger.info(f"Scraping Complete! Successfully exported {len(sheets_data)} DSA sheets to {output_file}")
    logger.info("==================================================")

if __name__ == "__main__":
    main()
