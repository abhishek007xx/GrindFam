import json

# Comprehensive catalog of all requested roadmap.sh roadmaps with fully reworded steps
all_new_roadmaps = [
    # ── Role Based Roadmaps ──
    {
        "id": "role-ai-engineer",
        "category": "Role Roadmap",
        "title": "AI Engineer Learning Path",
        "creator": "GrindFam Curriculum",
        "description": "Master building AI-powered applications — LLM integration, Prompt Engineering, RAG (Retrieval-Augmented Generation), LangChain, Vector Databases, and Fine-Tuning.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "LLM Fundamentals & API Integration",
                "subtitle": "OpenAI, Anthropic Claude, Hugging Face & Embeddings",
                "description": "Understand Large Language Model APIs, tokenization, context windows, and vector embeddings.",
                "guide": "### 1. How LLMs Work\nLLMs process text by converting words into vector embeddings in high-dimensional space.",
                "codeSnippet": "import openai\nclient = openai.OpenAI()\nres = client.chat.completions.create(model='gpt-4o', messages=[{'role': 'user', 'content': 'Explain RAG'}])\nprint(res.choices[0].message.content)",
                "submodules": [
                    {"name": "Tokenization & Context Window Limits", "status": "pending"},
                    {"name": "Vector Embeddings & Cosine Similarity", "status": "pending"},
                    {"name": "OpenAI & Anthropic Claude API Integration", "status": "pending"}
                ],
                "interviewFaqs": ["What is vector embedding cosine similarity?", "How does tokenization affect API billing and context limits?"],
                "resources": [{"type": "docs", "label": "OpenAI API Documentation", "url": "https://platform.openai.com/docs/"}],
                "topics": ["AI", "LLM", "Embeddings", "OpenAI", "Claude"],
                "icon": "zap", "color": "purple", "sourceUrl": "https://roadmap.sh/ai-engineer"
            },
            {
                "stepNumber": 2,
                "title": "Vector Databases & RAG Architecture",
                "subtitle": "Pinecone, Qdrant, ChromaDB & LangChain Framework",
                "description": "Build Retrieval-Augmented Generation (RAG) applications with vector databases and LangChain / LlamaIndex.",
                "guide": "### 1. RAG Pattern\n1. Chunk documents\n2. Generate embeddings\n3. Store in vector DB\n4. Query top-k nearest chunks\n5. Pass context to LLM",
                "codeSnippet": "from langchain_community.vectorstores import Chroma\n# RAG retriever pipeline sketch",
                "submodules": [
                    {"name": "Document Chunking Strategies (Fixed, Semantic)", "status": "pending"},
                    {"name": "Vector DB Indexing: HNSW, IVF", "status": "pending"},
                    {"name": "LangChain & LlamaIndex Frameworks", "status": "pending"}
                ],
                "interviewFaqs": ["What is chunking in RAG and why is chunk size critical?", "How does HNSW indexing speed up vector search?"],
                "resources": [{"type": "docs", "label": "Pinecone Vector DB Docs", "url": "https://www.pinecone.io/docs/"}],
                "topics": ["RAG", "Vector DB", "Pinecone", "LangChain", "ChromaDB"],
                "icon": "database", "color": "teal", "sourceUrl": "https://roadmap.sh/ai-engineer"
            }
        ]
    },
    {
        "id": "role-data-engineer",
        "category": "Role Roadmap",
        "title": "Data Engineer Learning Path",
        "creator": "GrindFam Curriculum",
        "description": "Architect data pipelines — Apache Spark, PySpark, Airflow, Snowflake, BigQuery, Kafka, and dbt data modeling.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Data Pipelines & Batch Processing with Spark",
                "subtitle": "PySpark, Distributed Dataframes & HDFS/S3",
                "description": "Process large-scale data with Apache Spark and PySpark. Master RDDs, DataFrames, and distributed joins.",
                "guide": "### 1. Apache Spark Architecture\nDriver program orchestrates executors across worker nodes, processing data in memory.",
                "codeSnippet": "from pyspark.sql import SparkSession\nspark = SparkSession.builder.appName('DataPipeline').getOrCreate()\ndf = spark.read.parquet('s3://my-bucket/data/')"
            }
        ]
    },
    {
        "id": "role-cyber-security",
        "category": "Role Roadmap",
        "title": "Cyber Security Engineer Learning Path",
        "creator": "GrindFam Curriculum",
        "description": "Master defensive & offensive security — Network Pentesting, OWASP Top 10, Cryptography, SIEM, and Vulnerability Assessment.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Network Security & Cryptography",
                "subtitle": "OSI Model, Wireshark, RSA, AES & TLS Protocols",
                "description": "Understand network traffic analysis and cryptographic encryption protocols.",
                "guide": "### 1. Symmetric vs Asymmetrical Encryption\nAES uses a single shared secret key. RSA uses public/private keypairs.",
                "codeSnippet": "# OpenSSL TLS certificate inspection\nopenssl s_client -connect google.com:443 -showcerts"
            }
        ]
    },
    {
        "id": "role-qa",
        "category": "Role Roadmap",
        "title": "QA & Software Testing Engineer",
        "creator": "GrindFam Curriculum",
        "description": "Automation testing with Selenium, Playwright, Cypress, Postman API testing, and CI/CD test integration.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Test Automation & E2E Testing",
                "subtitle": "Playwright, Cypress, Page Object Model (POM)",
                "description": "Write reliable end-to-end automation scripts using Playwright and Cypress.",
                "guide": "### 1. Page Object Model (POM)\nSeparate test scripts from UI locators for clean maintenance.",
                "codeSnippet": "// Playwright E2E Test\nimport { test, expect } from '@playwright/test';\ntest('login flow', async ({ page }) => {\n  await page.goto('/login');\n});"
            }
        ]
    },
    {
        "id": "role-blockchain",
        "category": "Role Roadmap",
        "title": "Blockchain & Web3 Developer Path",
        "creator": "GrindFam Curriculum",
        "description": "Build decentralized applications (DApps) — Ethereum, Solidity smart contracts, Ethers.js/Viem, and Web3 security.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Solidity & Ethereum Smart Contracts",
                "subtitle": "EVM, Smart Contracts, ERC-20 & Hardhat Framework",
                "description": "Write and deploy smart contracts to the Ethereum Virtual Machine using Solidity and Hardhat.",
                "guide": "### 1. Smart Contract Lifecycle\nWrite Solidity code → Compile to EVM Bytecode → Deploy to Ethereum blockchain.",
                "codeSnippet": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract Token {\n    mapping(address => uint256) public balances;\n}"
            }
        ]
    },
    {
        "id": "role-ux-design",
        "category": "Role Roadmap",
        "title": "UX / UI & Product Design Path",
        "creator": "GrindFam Curriculum",
        "description": "Master user research, wireframing, Figma design systems, prototyping, accessibility, and usability testing.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "User Research & Figma Design Systems",
                "subtitle": "Wireframes, Design Tokens, Components & Auto-Layout",
                "description": "Create scalable design systems and interactive prototypes in Figma.",
                "guide": "### 1. Design System Architecture\nDesign tokens → Primitive components → Composite UI components."
            }
        ]
    },
    {
        "id": "role-product-manager",
        "category": "Role Roadmap",
        "title": "Product Manager (PM) Learning Path",
        "creator": "GrindFam Curriculum",
        "description": "Product strategy, PRDs, user analytics, A/B testing, sprint planning, and cross-functional leadership.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Product Strategy & PRD Creation",
                "subtitle": "Problem Statements, User Stories, Acceptance Criteria & KPIs",
                "description": "Formulate product visions, write detailed PRDs, and track North Star metrics.",
                "guide": "### 1. PRD Structure\nProblem statement → Target persona → User stories → Acceptance criteria → Metrics."
            }
        ]
    },
    # ── Skill Based Roadmaps ──
    {
        "id": "tech-vibe-coding",
        "category": "Tech Roadmap",
        "title": "Vibe Coding & AI-Assisted Development",
        "creator": "GrindFam Curriculum",
        "description": "Build production apps ultra-fast using AI coding assistants (Cursor, Claude Code, GitHub Copilot) and rapid prototyping tools.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "AI Assistant Workflow & Prompt Engineering",
                "subtitle": "Cursor IDE, Claude Code CLI, Context Specs & Test-Driven Prompts",
                "description": "Master driving AI code generation using precise system instructions and iterative pair programming.",
                "guide": "### 1. Vibe Coding Principles\n1. Define specs in AGENTS.md\n2. Provide error tracebacks directly\n3. Review generated diffs carefully",
                "codeSnippet": "# Launch Claude Code CLI\nclaude --prompt \"Refactor user authentication to support OAuth2\""
            }
        ]
    },
    {
        "id": "tech-power-bi",
        "category": "Tech Roadmap",
        "title": "Power BI & Business Intelligence",
        "creator": "GrindFam Curriculum",
        "description": "Master Power BI — DAX queries, Power Query ETL, data modeling, interactive dashboard design, and Power BI Service publishing.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "DAX Queries & Data Modeling",
                "subtitle": "Power Query M Code, Star Schema & DAX Measures",
                "description": "Design star schema data models and write DAX measures for business KPIs.",
                "guide": "### 1. DAX Measures vs Calculated Columns\nMeasures evaluate dynamically at query time based on report filter context.",
                "codeSnippet": "Total Revenue = SUM(Sales[Amount])\nYoY Growth = DIVIDE([Total Revenue] - [Prior Year Revenue], [Prior Year Revenue])"
            }
        ]
    },
    {
        "id": "tech-flutter",
        "category": "Tech Roadmap",
        "title": "Flutter & Dart Mobile Developer",
        "creator": "GrindFam Curriculum",
        "description": "Build cross-platform mobile apps for iOS and Android using Dart, Flutter widgets, State Management (Riverpod/Bloc), and Firebase.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Dart Language & Flutter Widget Tree",
                "subtitle": "Stateless vs Stateful Widgets, Layouts & Navigation",
                "description": "Master Dart programming and Flutter's reactive widget tree architecture.",
                "codeSnippet": "import 'package:flutter/material.dart';\nvoid main() => runApp(MaterialApp(home: Text('Hello Flutter')));"
            }
        ]
    },
    {
        "id": "tech-docker-k8s",
        "category": "Tech Roadmap",
        "title": "Docker & Kubernetes Deep Dive",
        "creator": "GrindFam Curriculum",
        "description": "Containerize applications and manage container orchestration at scale with Kubernetes clusters.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Docker Containers & Microservices",
                "subtitle": "Dockerfile Optimization, Multi-Stage Builds & Compose",
                "description": "Build lean Docker images and run multi-container applications.",
                "codeSnippet": "FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD [\"npm\", \"start\"]"
            }
        ]
    },
    {
        "id": "tech-dsa",
        "category": "Tech Roadmap",
        "title": "Data Structures & Algorithms (DSA) Roadmap",
        "creator": "GrindFam Curriculum",
        "description": "Master coding interview DSA patterns: Arrays, Sliding Window, Two Pointers, Trees, Graphs, DP, and Bit Manipulation.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Arrays, Two Pointers & Sliding Window",
                "subtitle": "Frequency Maps, Prefix Sums & Subarray Patterns",
                "description": "Solve high-frequency coding interview problems with optimal O(N) time complexity.",
                "codeSnippet": "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i"
            }
        ]
    },
    {
        "id": "tech-git-github",
        "category": "Tech Roadmap",
        "title": "Git & GitHub Mastery",
        "creator": "GrindFam Curriculum",
        "description": "Version control fundamentals: branching, rebasing, merge conflict resolution, cherry-pick, and GitHub Actions CI/CD workflows.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Git Workflow & Advanced Branching",
                "subtitle": "Rebase vs Merge, Stash, Cherry-Pick & Conflict Resolution",
                "description": "Master clean Git commit history using interactive rebase and feature branch workflows.",
                "codeSnippet": "git checkout -b feature/auth\ngit commit -m 'feat: add OAuth2 login'\ngit pull --rebase origin main"
            }
        ]
    },
    {
        "id": "tech-nextjs",
        "category": "Tech Roadmap",
        "title": "Next.js & Full Stack React Framework",
        "creator": "GrindFam Curriculum",
        "description": "Build production React applications with Next.js App Router, Server Components (RSC), Server Actions, API routes, and SSG/ISR.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Next.js App Router & Server Components",
                "subtitle": "File-based Routing, React Server Components (RSC) & Server Actions",
                "description": "Understand Next.js 14/15 App Router conventions and zero-bundle-size Server Components.",
                "codeSnippet": "// App Router Server Component\nexport default async function Page() {\n  const data = await fetch('https://api.example.com/data');\n  return <div>{JSON.stringify(data)}</div>;\n}"
            }
        ]
    },
    {
        "id": "tech-aws",
        "category": "Tech Roadmap",
        "title": "AWS Cloud Architect Learning Path",
        "creator": "GrindFam Curriculum",
        "description": "Architect cloud infrastructure on Amazon Web Services: EC2, S3, RDS, Lambda serverless, VPC networking, IAM security, and CloudFront.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "AWS Core Services & IAM Security",
                "subtitle": "VPC Subnets, EC2 Instances, S3 Buckets & IAM Roles",
                "description": "Provision secure cloud networks and virtual servers in AWS.",
                "codeSnippet": "# AWS CLI list S3 buckets\naws s3 ls"
            }
        ]
    }
]

# Load existing detailed_roadmaps_data.json
with open('frontend/src/data/detailed_roadmaps_data.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_ids = {r['id'] for r in existing}

added_count = 0
for r in all_new_roadmaps:
    if r['id'] not in existing_ids:
        existing.append(r)
        added_count += 1

with open('frontend/src/data/detailed_roadmaps_data.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, indent=2)

print(f"Successfully added {added_count} new roadmap tracks! Total catalog size: {len(existing)}")
