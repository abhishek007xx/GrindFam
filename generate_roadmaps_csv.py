import csv
import os

# Define output file paths
CSV_PATH_ROOT = "comprehensive_role_and_sheet_roadmaps.csv"
CSV_PATH_FRONTEND = os.path.join("frontend", "src", "data", "comprehensive_role_and_sheet_roadmaps.csv")

headers = [
    "Roadmap_Category",
    "Roadmap_ID",
    "Roadmap_Title",
    "Creator_or_Source",
    "Step_Number",
    "Node_Title",
    "Node_Subtitle_or_Summary",
    "Detailed_Description",
    "Key_Topics_Covered",
    "Recommended_Problems_or_Skills",
    "Icon_Type",
    "Node_Color_Theme",
    "Source_URL"
]

rows = []

def add_node(category, r_id, title, creator, step_num, node_title, subtitle, desc, topics, problems, icon, color, url):
    rows.append({
        "Roadmap_Category": category,
        "Roadmap_ID": r_id,
        "Roadmap_Title": title,
        "Creator_or_Source": creator,
        "Step_Number": str(step_num),
        "Node_Title": node_title,
        "Node_Subtitle_or_Summary": subtitle,
        "Detailed_Description": desc,
        "Key_Topics_Covered": topics,
        "Recommended_Problems_or_Skills": problems,
        "Icon_Type": icon,
        "Node_Color_Theme": color,
        "Source_URL": url
    })

# ==============================================================================
# 1. ROLE ROADMAPS
# ==============================================================================

# --- SDE Intern / Entry Level Track ---
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    1, "Language & Syntax Fundamentals", "C++, Java, or Python Core Mastery",
    "Master variables, conditional branching, loops, functions (pass by value vs reference), and standard input/output formatting. Build logical clarity using pattern printing problems.",
    "Syntax, Input/Output, Loops, Pass-by-Reference, Basic Math",
    "user-input-output-data-types, if-else-statements-control-flow, pattern-1-square-star-pattern",
    "code", "blue", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    2, "Time & Space Complexity & Basic Math", "Asymptotic Analysis & Math Warmups",
    "Understand Big-O notation, worst/average/best case complexity. Master basic math operations like count digits, reverse integer, palindrome check, and GCD/LCM.",
    "Big-O Notation, Time Complexity, Space Complexity, Prime Numbers, GCD",
    "count-digits, reverse-integer, palindrome-number, armstrong-numbers",
    "lightbulb", "yellow", "https://leetcode.com"
)
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    3, "Arrays & Hashing Warmup", "Searching, Two Pointers & Hash Tables",
    "Learn 1D and 2D arrays, linear search, binary search on 1D arrays, hashing using HashMap / unordered_map, and basic two pointer techniques.",
    "Arrays, Linear Search, Binary Search, Hash Maps, Frequency Counting",
    "two-sum, valid-anagram, contains-duplicate, binary-search",
    "search", "purple", "https://leetcode.com"
)
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    4, "Core Data Structures (Lists, Stacks, Queues)", "Pointers, Nodes & Linear Containers",
    "Implement singly and doubly linked lists. Understand Stack LIFO and Queue FIFO principles using arrays and linked nodes. Solve standard stack problems like matching parentheses.",
    "Linked Lists, Stack (LIFO), Queue (FIFO), Monotonic Stack Basics",
    "reverse-linked-list, merge-two-sorted-lists, valid-parentheses",
    "tool", "green", "https://leetcode.com"
)
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    5, "CS Fundamentals & Aptitude", "OS, DBMS SQL, & Networking Core",
    "Prepare for core computer science interview questions: Operating System process/threads, DBMS SQL queries (Joins, GROUP BY), and Computer Networks (TCP/IP, HTTP/HTTPS).",
    "Operating Systems, DBMS, SQL Joins, Computer Networks, Aptitude",
    "sql-joins, process-vs-threads, tcp-vs-udp",
    "shield", "indigo", "https://takeuforward.org"
)
add_node(
    "Role Roadmap", "role-intern", "SDE Intern & Entry Level Roadmap", "GrindFam Curriculum",
    6, "ATS Resume & Timed Mock OA", "60-Minute Timed Test Simulation",
    "Format your resume using ATS-friendly templates (Action Verb + Quantifiable Impact). Practice 60-minute timed Online Assessment speed runs to build exam speed.",
    "Resume Formatting, ATS Optimization, Timed OA Speed, STAR Framework",
    "timed-oa-simulation-1, timed-oa-simulation-2",
    "target", "red", "https://grindfam.vercel.app"
)

# --- Campus Placement Track (3-Month Sprint) ---
add_node(
    "Role Roadmap", "role-campus-placement", "Campus Placement 3-Month Sprint Roadmap", "GrindFam Curriculum",
    1, "Month 1: Deep DSA Foundations", "Arrays, Matrix, Sliding Window & Binary Search",
    "Build speed in core array techniques: Two Pointers, Sliding Window, Prefix Sum, Binary Search on Answer space, and 2D Matrix traversals.",
    "Two Pointers, Sliding Window, Prefix Sum, Binary Search on Answer Space",
    "3sum, longest-substring-without-repeating-characters, search-in-rotated-sorted-array",
    "code", "blue", "https://neetcode.io"
)
add_node(
    "Role Roadmap", "role-campus-placement", "Campus Placement 3-Month Sprint Roadmap", "GrindFam Curriculum",
    2, "Month 2: Trees, Graphs & DP Patterns", "Non-Linear Data Structures & Dynamic Programming",
    "Master Binary Tree traversals, BST properties, Graph BFS/DFS, Topological Sort, Dijkstra's algorithm, and 1D/2D Dynamic Programming patterns.",
    "Binary Trees, BST, Graph BFS/DFS, Topological Sort, 1D/2D DP, Knapsack",
    "number-of-islands, course-schedule, coin-change, lowest-common-ancestor-of-a-binary-tree",
    "cloud", "indigo", "https://takeuforward.org"
)
add_node(
    "Role Roadmap", "role-campus-placement", "Campus Placement 3-Month Sprint Roadmap", "GrindFam Curriculum",
    3, "Month 3: Company OA Patterns & Mock HR", "High Frequency Company Questions & STAR Prep",
    "Solve the top 50 high-frequency OA questions for tier-1 tech companies. Practice mock technical interviews and prepare STAR behavioral stories.",
    "Company OA Patterns, Mock Technical Interviews, STAR HR Round Prep",
    "product-of-array-except-self, container-with-most-water, word-search",
    "award", "red", "https://leetcode.com"
)

# --- Senior / Lateral Level Track ---
add_node(
    "Role Roadmap", "role-senior-sde", "Senior / Lateral SDE Track Roadmap", "GrindFam Curriculum",
    1, "Advanced Algorithms & Hard Patterns", "Hard DP, Graph Flows & Segment Trees",
    "Solve complex algorithmic problems involving Monotonic Queue, Disjoint Set Union (DSU), Segment Trees, Hard Dynamic Programming (Bitmask/Tree DP), and String matching algorithms.",
    "Hard DP, DSU, Segment Trees, Monotonic Queue, String Tries",
    "trapping-rain-water, merge-k-sorted-lists, median-of-two-sorted-arrays, sliding-window-maximum",
    "zap", "red", "https://leetcode.com"
)
add_node(
    "Role Roadmap", "role-senior-sde", "Senior / Lateral SDE Track Roadmap", "GrindFam Curriculum",
    2, "Low-Level Design (LLD) & Object-Oriented", "SOLID Principles & Design Patterns",
    "Master SOLID design principles, Object-Oriented Analysis and Design (OOAD), UML Class Diagrams, and Design Patterns (Factory, Singleton, Strategy, Observer, Decorator). Practice designing LRU Cache, Parking Lot, Elevator System.",
    "SOLID Principles, Design Patterns, Class Diagrams, Schema Design",
    "lru-cache, lfu-cache, design-in-memory-file-system, design-parking-lot",
    "tool", "purple", "https://refactoring.guru"
)
add_node(
    "Role Roadmap", "role-senior-sde", "Senior / Lateral SDE Track Roadmap", "GrindFam Curriculum",
    3, "High-Level Design (HLD) & Distributed Systems", "Scalability, Caching, DB Sharding & Queues",
    "Learn to architect large-scale distributed systems: Load Balancers, API Gateways, Caching (Redis/Memcached), Database Sharding/Replication, Message Queues (Kafka), Rate Limiters, URL Shortener, and Distributed Locks.",
    "System Design, Scalability, Redis Caching, DB Sharding, Kafka, Rate Limiting",
    "design-rate-limiter, design-url-shortener, design-whatsapp, design-notification-service",
    "database", "green", "https://bytebytego.com"
)
add_node(
    "Role Roadmap", "role-senior-sde", "Senior / Lateral SDE Track Roadmap", "GrindFam Curriculum",
    4, "Leadership, System Ownership & Negotiation", "Amazon LPs, Googliness & Compensation",
    "Prepare senior leadership answers using Amazon 16 Leadership Principles and Google Googliness standards. Master salary, RSUs/Equity, and counter-offer negotiation scripts.",
    "Leadership Principles, Stakeholder Management, Salary Negotiation",
    "leadership-conflict-resolution, system-ownership-story, salary-negotiation-script",
    "award", "yellow", "https://levels.fyi"
)

# --- Frontend Developer Roadmap ---
add_node(
    "Role Roadmap", "role-frontend", "Frontend Developer Roadmap", "roadmap.sh & Industry Standards",
    1, "HTML, CSS & Modern UI Fundamentals", "Semantic Structure, Responsive Layouts & Styling",
    "Master HTML5 semantic tags, CSS Flexbox & Grid layouts, Responsive Web Design (Media Queries), CSS Variables, and CSS Architectures (BEM, Vanilla CSS, Tailwind).",
    "HTML5, CSS3, Flexbox, CSS Grid, Responsive Web Design, Tailwind CSS",
    "semantic-html, flexbox-layout, css-grid-challenge, responsive-navbar",
    "code", "blue", "https://roadmap.sh/frontend"
)
add_node(
    "Role Roadmap", "role-frontend", "Frontend Developer Roadmap", "roadmap.sh & Industry Standards",
    2, "JavaScript Deep Dive & DOM", "ES6+, Async JS, Closures & Event Loop",
    "Master JavaScript fundamentals: Execution Context, Scope & Closures, Prototypes, Promises, Async/Await, Event Loop, DOM Events, and Fetch API.",
    "ES6+, Closures, Event Loop, Promises, Fetch API, DOM Manipulation",
    "js-closures-challenge, custom-promise-implementation, debounce-throttle",
    "zap", "yellow", "https://javascript.info"
)
add_node(
    "Role Roadmap", "role-frontend", "Frontend Developer Roadmap", "roadmap.sh & Industry Standards",
    3, "React & Modern Web Frameworks", "Hooks, State Management & SSR/SSG",
    "Learn React core: Components, JSX, Props, State, useEffect, Custom Hooks, Zustand/Redux for state management, Next.js for Server-Side Rendering (SSR) & Static Site Generation (SSG).",
    "React.js, Next.js, Hooks, State Management, SSR/SSG, Component Architecture",
    "react-custom-hook, state-management-zustand, nextjs-routing-ssr",
    "tool", "teal", "https://react.dev"
)
add_node(
    "Role Roadmap", "role-frontend", "Frontend Developer Roadmap", "roadmap.sh & Industry Standards",
    4, "Frontend Performance, Testing & CI/CD", "Web Vitals, Bundle Optimization & Testing",
    "Optimize Core Web Vitals (LCP, CLS, FID), Code Splitting (Lazy Loading), Tree Shaking, Unit Testing with Vitest/Jest, and End-to-End testing with Cypress/Playwright.",
    "Web Vitals, Lazy Loading, Bundle Optimization, Vitest, Cypress, CI/CD",
    "bundle-size-optimization, core-web-vitals-audit, vitest-component-testing",
    "shield", "green", "https://web.dev"
)

# --- Backend Developer Roadmap ---
add_node(
    "Role Roadmap", "role-backend", "Backend Developer Roadmap", "roadmap.sh & Industry Standards",
    1, "Language & Core Server Concepts", "Node.js / Python / Go Server Execution",
    "Learn backend programming languages (Node.js, Python FastAPI/Django, or Go). Master HTTP methods, status codes, RESTful API design principles, and JSON payload handling.",
    "HTTP/HTTPS, REST API, JSON, Express.js, Async I/O, Node.js",
    "build-rest-api, http-status-code-handling, async-io-event-loop",
    "terminal", "indigo", "https://roadmap.sh/backend"
)
add_node(
    "Role Roadmap", "role-backend", "Backend Developer Roadmap", "roadmap.sh & Industry Standards",
    2, "Database Systems & Data Modeling", "Relational SQL & NoSQL Databases",
    "Understand Relational Databases (PostgreSQL, MySQL) vs NoSQL (MongoDB, Redis). Master SQL queries, Indexing, Transactions (ACID), Foreign Keys, and ORMs (Prisma, TypeORM, SQLAlchemy).",
    "PostgreSQL, MongoDB, Redis, SQL Queries, Indexing, ACID Transactions",
    "sql-join-optimization, redis-caching-layer, prisma-schema-migration",
    "database", "blue", "https://postgresql.org"
)
add_node(
    "Role Roadmap", "role-backend", "Backend Developer Roadmap", "roadmap.sh & Industry Standards",
    3, "Authentication, Security & Microservices", "OAuth2, JWT, Rate Limiting & Message Queues",
    "Implement User Authentication (JWT, Session Cookies, OAuth2 Google Sign-In), Password Hashing (bcrypt), Rate Limiting, API Gateways, and Asynchronous Message Queues (RabbitMQ/Kafka).",
    "JWT, OAuth2, Rate Limiting, CORS, Security Headers, Kafka, Microservices",
    "jwt-auth-middleware, rate-limiter-redis, message-queue-worker",
    "shield", "purple", "https://oauth.net"
)

# --- PostgreSQL DBA & Database Engineer Roadmap (Scraped from roadmap.sh) ---
add_node(
    "Role Roadmap", "role-postgresql-dba", "PostgreSQL DBA & Database Engineer Roadmap", "roadmap.sh (Official)",
    1, "Database Administration Fundamentals", "Relational Concepts & SQL Mastery",
    "Master SQL Data Definition (DDL), Data Manipulation (DML), Transaction Control (TCL), Relational Integrity Constraints, and Data Normalization (1NF to 3NF).",
    "SQL, Relational Modeling, DDL, DML, Normalization, Primary/Foreign Keys",
    "postgresql-schema-design, sql-complex-joins, normalization-exercise",
    "database", "blue", "https://roadmap.sh/postgresql-dba"
)
add_node(
    "Role Roadmap", "role-postgresql-dba", "PostgreSQL DBA & Database Engineer Roadmap", "roadmap.sh (Official)",
    2, "PostgreSQL Architecture & Storage", "Process Model, Shared Buffers & WAL",
    "Understand PostgreSQL internals: Background processes (Postmaster, Writer, Checkpointer, WAL Writer, Autovacuum), Shared Buffers memory architecture, Write-Ahead Logging (WAL), and Heap storage pages.",
    "PostgreSQL Internals, Shared Buffers, WAL, Heap Files, Checkpointer, Autovacuum",
    "shared-buffers-config, wal-archive-setup, vacuum-autovacuum-tuning",
    "tool", "indigo", "https://roadmap.sh/postgresql-dba"
)
add_node(
    "Role Roadmap", "role-postgresql-dba", "PostgreSQL DBA & Database Engineer Roadmap", "roadmap.sh (Official)",
    3, "Query Optimization & Performance Tuning", "EXPLAIN ANALYZE & Indexing Strategies",
    "Master EXPLAIN ANALYZE query execution plans. Learn Indexing types (B-Tree, Hash, GIN, GiST, BRIN), Partial Indexes, Expression Indexes, and work_mem / maintenance_work_mem configuration.",
    "EXPLAIN ANALYZE, B-Tree Indexes, GIN/GiST Indexes, Query Planner, Performance Tuning",
    "explain-analyze-optimization, gin-index-jsonb, memory-tuning-postgres",
    "zap", "yellow", "https://roadmap.sh/postgresql-dba"
)
add_node(
    "Role Roadmap", "role-postgresql-dba", "PostgreSQL DBA & Database Engineer Roadmap", "roadmap.sh (Official)",
    4, "High Availability, Replication & Backup", "Streaming Replication, PITR & Failover",
    "Configure Physical & Logical Streaming Replication, Connection Pooling (PgBouncer), Physical Backups (pg_basebackup, WAL-G/pgBackRest), Point-in-Time Recovery (PITR), and Failover (Patroni).",
    "Streaming Replication, Logical Replication, PgBouncer, PITR, Patroni, pgBackRest",
    "pgbouncer-connection-pool, streaming-replication-setup, pitr-recovery-drill",
    "cloud", "green", "https://roadmap.sh/postgresql-dba"
)
add_node(
    "Role Roadmap", "role-postgresql-dba", "PostgreSQL DBA & Database Engineer Roadmap", "roadmap.sh (Official)",
    5, "Database Security & Production Operations", "RBAC, SSL/TLS Encryption & Monitoring",
    "Enforce Role-Based Access Control (RBAC), pg_hba.conf client authentication, SSL encryption, Audit Logging (pgaudit), and Prometheus/Grafana / pg_stat_statements monitoring.",
    "pg_hba.conf, RBAC, SSL/TLS, pg_stat_statements, Prometheus, Grafana, Audit Logging",
    "pghba-security-lockdown, pgstatstatements-top-queries, prometheus-postgres-exporter",
    "shield", "red", "https://roadmap.sh/postgresql-dba"
)

# ==============================================================================
# 2. COMPANY ROADMAPS (EXPANDED TO ALL MAJOR TECH COMPANIES)
# ==============================================================================

# --- Google ---
add_node(
    "Company Roadmap", "company-google", "Google SDE Interview Roadmap", "Google Tech Guidelines",
    1, "Google Round 1: Online Assessment", "Speed & Graph/Array Precision",
    "Google OA focuses on high-precision algorithm solving. Solve 2 problems in 90 minutes. Focus on Array manipulation, Matrix traversals, Map/Set frequency counting, and String algorithms.",
    "Array, Matrix, Hash Map, String Algorithms, Speed Precision",
    "two-sum, 3sum, fruit-into-baskets, unique-email-addresses",
    "code", "blue", "https://careers.google.com"
)
add_node(
    "Company Roadmap", "company-google", "Google SDE Interview Roadmap", "Google Tech Guidelines",
    2, "Google Round 2 & 3: Graphs, Trees & Hard DP", "Complex Algorithmic Onsite Rounds",
    "Deep dive into Graph BFS/DFS, Topological Sort, Shortest Path (Dijkstra), Tree Traversals (LCA), Segment Trees, and Multi-Dimensional Dynamic Programming. Write bug-free code on Google Docs.",
    "Graph BFS/DFS, Topological Sort, Dijkstra, LCA, Dynamic Programming, Segment Trees",
    "number-of-islands, course-schedule, word-ladder, trapping-rain-water, alien-dictionary",
    "zap", "red", "https://careers.google.com"
)
add_node(
    "Company Roadmap", "company-google", "Google SDE Interview Roadmap", "Google Tech Guidelines",
    3, "Google Round 4: System Architecture & Googliness", "Scalable System Design & Leadership",
    "Design scalable distributed systems (e.g. Google Drive, Search Autocomplete, Web Crawler). Demonstrate Googliness: handling ambiguity, collaboration, and ethical decision-making.",
    "System Design, Distributed Systems, Googliness, Scalability, Trade-off Analysis",
    "design-search-autocomplete, design-web-crawler, googliness-behavioral-prep",
    "award", "yellow", "https://careers.google.com"
)

# --- Amazon ---
add_node(
    "Company Roadmap", "company-amazon", "Amazon SDE Interview Roadmap", "Amazon Engineering Guidelines",
    1, "Amazon OA: Coding & Work Simulation", "Debugging, Coding & Work Style Assessment",
    "Complete 2 coding questions + Amazon Work Style Simulation. Focus on Strings, Two Pointers, Trees, Priority Queues (Min/Max Heap), and Sliding Window.",
    "Arrays, Strings, Heap, Two Pointers, Amazon Work Style Simulation",
    "kth-largest-element-in-an-array, reorder-data-in-log-files, top-k-frequent-words",
    "code", "yellow", "https://amazon.jobs"
)
add_node(
    "Company Roadmap", "company-amazon", "Amazon SDE Interview Roadmap", "Amazon Engineering Guidelines",
    2, "Amazon Onsite: DSA & 16 Leadership Principles", "Customer Obsession & Bar Raiser Round",
    "Solve core coding problems on Binary Trees, BSTs, Graphs, and DP. Every single technical interview begins with 20 minutes of Amazon 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action).",
    "Binary Trees, BST, Graphs, DP, Amazon 16 Leadership Principles, STAR Method",
    "lowest-common-ancestor-of-a-binary-tree, word-break, amazon-leadership-stories",
    "award", "indigo", "https://amazon.jobs"
)

# --- Microsoft ---
add_node(
    "Company Roadmap", "company-microsoft", "Microsoft SDE Interview Roadmap", "Microsoft Interview Process",
    1, "Microsoft Codility OA", "Bit Manipulation, Arrays & String Processing",
    "Solve 3 coding tasks on Codility in 80 minutes. High emphasis on edge case handling, boundary conditions, Bitwise operations, Array manipulation, and String parsing.",
    "Bit Manipulation, String Parsing, Array Edge Cases, Codility Speed",
    "single-number, reverse-words-in-a-string, search-in-rotated-sorted-array",
    "code", "teal", "https://careers.microsoft.com"
)
add_node(
    "Company Roadmap", "company-microsoft", "Microsoft SDE Interview Roadmap", "Microsoft Interview Process",
    2, "Microsoft Technical Rounds & System Design", "Trees, Matrices, DP & Architecture",
    "Solve technical problems on Binary Trees, Matrix DFS, Dynamic Programming, and Low-Level Object-Oriented Design. Demonstrate clear communication and step-by-step problem breakdown.",
    "Binary Trees, Matrix DFS, DP, LLD, System Architecture, AA Round Prep",
    "serialize-and-deserialize-binary-tree, lru-cache, design-tic-tac-toe",
    "cloud", "blue", "https://careers.microsoft.com"
)

# --- Meta (Facebook) ---
add_node(
    "Company Roadmap", "company-meta", "Meta (Facebook) SDE Interview Roadmap", "Meta Engineering Recruiting",
    1, "Meta Screening: 2 Questions in 45 Mins", "Maximum Speed & High Frequency",
    "Meta screening requires solving 2 LeetCode questions in 45 minutes with optimal time complexity and zero syntax bugs. Focus heavily on Top 50 Meta Questions.",
    "Top Meta Questions, Two Pointers, String Parsing, Trees, Speed",
    "valid-palindrome-ii, 3sum, lowest-common-ancestor-of-a-binary-tree, subarray-sum-equals-k",
    "code", "blue", "https://metacareers.com"
)
add_node(
    "Company Roadmap", "company-meta", "Meta (Facebook) SDE Interview Roadmap", "Meta Engineering Recruiting",
    2, "Meta Technical Onsite & Product System Design", "Coding Onsite & Scale Architecture",
    "Complete 2 coding onsite rounds + Product/System Design (e.g., Newsfeed, Messenger, Instagram Stories). Focus on data model, API contracts, caching, and rate limiting.",
    "Graph DFS, Tree Traversals, System Design, Caching, Newsfeed Architecture",
    "vertical-order-traversal-of-a-binary-tree, design-news-feed, design-live-commenting",
    "database", "purple", "https://metacareers.com"
)

# --- Apple ---
add_node(
    "Company Roadmap", "company-apple", "Apple Software Engineer Roadmap", "Apple Hiring Process",
    1, "Apple Technical Screen & Core Concepts", "Low-Level Fundamentals & Algorithms",
    "Focus on C++/Swift/Java low-level memory management, Object-Oriented Programming, Data Structure fundamentals, Bitwise tricks, and String algorithms.",
    "C++, Memory Management, OOP, Bit Manipulation, Arrays, Strings",
    "lru-cache, reverse-bits, implement-trie-prefix-tree",
    "code", "teal", "https://apple.com/careers"
)
add_node(
    "Company Roadmap", "company-apple", "Apple Software Engineer Roadmap", "Apple Hiring Process",
    2, "Apple Onsite: System Architecture & Culture", "System Quality, Modularization & Testing",
    "Apple onsite evaluates clean architecture, modular software engineering, privacy-first design, concurrency/multi-threading, and hardware-software integration.",
    "Concurrency, Multi-Threading, System Architecture, Modular Design, Privacy",
    "print-in-order, design-bounded-blocking-queue, apple-culture-alignment",
    "shield", "indigo", "https://apple.com/careers"
)

# --- Netflix ---
add_node(
    "Company Roadmap", "company-netflix", "Netflix Senior SDE Interview Roadmap", "Netflix Culture & Engineering",
    1, "Netflix Technical Screening & Architecture", "Resilience & Microservices Focus",
    "Netflix focuses on senior-level engineering. Demonstrate deep knowledge of Microservice architectures, API Gateway design, Distributed Caching (Memcached/Redis), and fault-tolerance.",
    "Microservices, Resilience, Circuit Breakers, Redis, Distributed Systems",
    "design-video-streaming-service, design-recommendation-engine, fault-tolerant-gateway",
    "cloud", "red", "https://jobs.netflix.com"
)
add_node(
    "Company Roadmap", "company-netflix", "Netflix Senior SDE Interview Roadmap", "Netflix Culture & Engineering",
    2, "Netflix Culture Memo & Keeper Test Round", "Freedom & Responsibility Alignment",
    "Netflix conducts intensive culture rounds based on their famous Culture Memo (Freedom & Responsibility, High Performance, Stunning Colleagues, Context Not Control).",
    "Culture Memo, Keeper Test, Freedom & Responsibility, High Performance",
    "netflix-culture-alignment, keeper-test-scenarios, leadership-tradeoffs",
    "award", "yellow", "https://jobs.netflix.com"
)

# --- Uber ---
add_node(
    "Company Roadmap", "company-uber", "Uber Core Engineering Roadmap", "Uber Tech Recruiting",
    1, "Uber CodeSignal OA & Spatial Algorithms", "CodeSignal Speed & Graph / Matrix Focus",
    "Uber CodeSignal OA has 4 tasks in 70 mins. Onsite coding heavily emphasizes Graph algorithms (Dijkstra, Topological Sort), Spatial Indexing (QuadTrees / H3), and Hard DP.",
    "CodeSignal Speed, Graph Algorithms, Dijkstra, Spatial Indexing, Hard DP",
    "bus-routes, shortest-path-in-a-grid-with-obstacles-elimination, sliding-puzzle",
    "zap", "black", "https://uber.com/careers"
)
add_node(
    "Company Roadmap", "company-uber", "Uber Core Engineering Roadmap", "Uber Tech Recruiting",
    2, "Uber High-Scale System Design", "Real-Time Driver Matching & Surge Engine",
    "Design real-time distributed systems: Rider-Driver Matching Engine, Surge Pricing Calculator, Trip Location Tracking, and High-Throughput Notification dispatching.",
    "Geospatial Indexing, Real-time Systems, Kafka, Surge Engine Design",
    "design-uber-ride-matching, design-surge-pricing, geospatial-indexing-h3",
    "database", "green", "https://uber.com/careers"
)

# --- Swiggy & Zomato ---
add_node(
    "Company Roadmap", "company-swiggy", "Swiggy & Zomato SDE Interview Roadmap", "Hyperlocal Tech Standards",
    1, "Coding Round: High Frequency Arrays & Graphs", "Matrix & Greedy Routing Algorithms",
    "Solve algorithmic problems on Arrays, Two Pointers, Sliding Window, Matrix Shortest Path, and Graph Traversals tailored for delivery logistics.",
    "Arrays, Sliding Window, Matrix BFS/DFS, Shortest Path Routing",
    "3sum, number-of-islands, shortest-path-in-binary-matrix, coin-change",
    "code", "orange", "https://careers.swiggy.com"
)
add_node(
    "Company Roadmap", "company-swiggy", "Swiggy & Zomato SDE Interview Roadmap", "Hyperlocal Tech Standards",
    2, "Machine Coding & High Scale HLD", "Order Engine LLD & Flash Sale HLD",
    "Machine coding round: Implement fully functional Order Processing Engine or Delivery Agent Assignment in 90 mins. HLD round: Design Flash Sale & Hyper-local Delivery Engine.",
    "Machine Coding, LLD, Order Processing Engine, Flash Sale HLD, Redis",
    "design-food-delivery-system, machine-coding-order-management, redis-geospatial",
    "database", "red", "https://zomato.com/careers"
)

# --- Flipkart & Razorpay ---
add_node(
    "Company Roadmap", "company-flipkart", "Flipkart & Razorpay SDE Interview Roadmap", "Fintech & E-Commerce Standards",
    1, "90-Minute Machine Coding Round", "Object-Oriented Design & Clean Code",
    "Write fully executable, clean, modular object-oriented code for a problem statement (e.g. Payment Gateway Aggregator, Inventory Management, Coupon Discount System).",
    "Machine Coding, Clean Code, SOLID Principles, Extensible Architecture",
    "machine-coding-payment-gateway, machine-coding-inventory-system, lru-cache",
    "tool", "blue", "https://flipkartcareers.com"
)
add_node(
    "Company Roadmap", "company-flipkart", "Flipkart & Razorpay SDE Interview Roadmap", "Fintech & E-Commerce Standards",
    2, "Fintech HLD & Idempotent Systems", "Distributed Transactions & Idempotency",
    "Design high-reliability systems: Idempotent Payment Processing, Distributed Ledger, Rate Limiting, Transactional Outbox Pattern, and Double-Entry Accounting Architecture.",
    "Idempotency, Distributed Transactions, Transactional Outbox, Payment Ledger",
    "design-payment-gateway, design-wallet-system, idempotent-api-design",
    "shield", "green", "https://razorpay.com/jobs"
)

# ==============================================================================
# 3. CREATOR DSA SHEETS ROADMAPS
# ==============================================================================

# --- Striver's A2Z DSA Mastery Roadmap ---
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    1, "Step 1: Learn the Basics", "Syntax, Time Complexity, Math & Recursion",
    "Master basic syntax, time complexity calculation, count digits, reverse number, GCD, basic recursion, and hashing concepts.",
    "Language Basics, Time Complexity, Basic Math, Recursion, Hashing",
    "user-input-output-data-types, count-digits, reverse-integer, valid-palindrome",
    "code", "blue", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    2, "Step 2 & 3: Sorting & Array Masterclass", "Selection, Merge, Quick Sort & Array Problems",
    "Learn Selection, Bubble, Insertion, Merge Sort, Quick Sort. Solve Easy, Medium & Hard Array problems (Largest element, Second largest, Move Zeroes, Two Sum, 3Sum, Kadane's).",
    "Sorting Algorithms, Arrays Easy/Medium/Hard, Two Pointers, Kadane Algorithm",
    "second-largest-element, move-zeroes, two-sum, maximum-subarray, 3sum, 4sum",
    "zap", "yellow", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    3, "Step 4 & 5: Binary Search & Strings", "Binary Search on Answers & String Algorithms",
    "Master Binary Search on 1D arrays, 2D matrices, and Search Space. Learn String manipulation, Reverse Words, Valid Anagram, Isomorphic Strings, and KMP algorithm basics.",
    "Binary Search, Search Space, 2D Matrix Search, Strings, Anagrams",
    "binary-search, search-in-rotated-sorted-array, search-a-2d-matrix, valid-anagram",
    "search", "teal", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    4, "Step 6 to 9: LinkedList, Recursion, Bit & Stacks", "Linear Containers, Backtracking & Monotonic Stack",
    "Master Singly & Doubly LinkedList, Combination Sum, N-Queens, Sudoku Solver, Bitwise operators, Monotonic Stack (Next Greater Element, Trapping Rain Water), and LRU Cache.",
    "LinkedList, Recursion, Backtracking, Bit Manipulation, Monotonic Stack, LRU Cache",
    "reverse-linked-list, combination-sum, n-queens, next-greater-element-i, lru-cache",
    "tool", "purple", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    5, "Step 10 to 12: Sliding Window, Heaps & Greedy", "Two Pointers, Min/Max Heap & Greedy Choice",
    "Master Sliding Window (Constant Window, Longest Substring), Heaps (Top K Elements, Min Heap), and Greedy Choice (N Meetings in one room, Fractional Knapsack).",
    "Sliding Window, Two Pointers, Heap, Priority Queue, Greedy Choice",
    "longest-substring-without-repeating-characters, top-k-frequent-elements, n-meetings-in-one-room",
    "lightbulb", "green", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    6, "Step 13 to 15: Trees, BST & Graphs", "Traversals, LCA, BFS/DFS & Shortest Paths",
    "Master Binary Trees (Traversals, Height, Diameter, LCA), BST (Insert, Delete, Search), Graphs (BFS/DFS, Topological Sort, Dijkstra, Bellman-Ford, Disjoint Set Union).",
    "Binary Trees, BST, Graph BFS/DFS, Topological Sort, Dijkstra, Disjoint Set",
    "binary-tree-level-order-traversal, lowest-common-ancestor-of-a-binary-tree, number-of-islands, course-schedule",
    "cloud", "indigo", "https://takeuforward.org/strivers-a2z-dsa-course/"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-striver-sde", "Striver's A2Z DSA Mastery Roadmap", "Striver (takeUforward)",
    7, "Step 16 & 17: Dynamic Programming & Tries", "1D/2D DP, Subsequences, Strings & Trie Nodes",
    "Master Dynamic Programming (Climbing Stairs, House Robber, 2D Grid DP, 0/1 Knapsack, Coin Change, LIS, MCM) and Trie Data Structure (Insert, Search, Max XOR).",
    "1D/2D DP, Knapsack, Coin Change, LIS, MCM, Trie Implementation",
    "climbing-stairs, coin-change, longest-increasing-subsequence, implement-trie-prefix-tree",
    "award", "red", "https://takeuforward.org/strivers-a2z-dsa-course/"
)

# --- NeetCode 150 Master Roadmap ---
add_node(
    "Creator DSA Sheet Roadmap", "sheet-neetcode-150", "NeetCode 150 Master Roadmap", "NeetCode (Navdeep Singh)",
    1, "Arrays & Hashing (9 Problems)", "Foundational Hash Map & Array Patterns",
    "Master array hashing, frequency counting, and string anagrams. Build intuition for O(n) space-time trade-offs.",
    "Arrays, Hash Map, Frequency Counting, Anagrams",
    "contains-duplicate, valid-anagram, two-sum, group-anagrams, top-k-frequent-elements, product-of-array-except-self, valid-sudoku, encode-and-decode-strings, longest-consecutive-sequence",
    "code", "blue", "https://neetcode.io/roadmap"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-neetcode-150", "NeetCode 150 Master Roadmap", "NeetCode (Navdeep Singh)",
    2, "Two Pointers & Sliding Window (11 Problems)", "Linear Scanning & Subarray Windows",
    "Master Two Pointer convergences and Variable/Fixed-size Sliding Windows for string/array subarray optimization.",
    "Two Pointers, Sliding Window, Subarrays, String Windowing",
    "valid-palindrome, 3sum, container-with-most-water, trapping-rain-water, best-time-to-buy-and-sell-stock, longest-substring-without-repeating-characters, longest-repeating-character-replacement, minimum-window-substring",
    "zap", "teal", "https://neetcode.io/roadmap"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-neetcode-150", "NeetCode 150 Master Roadmap", "NeetCode (Navdeep Singh)",
    3, "Stack & Binary Search (14 Problems)", "LIFO Buffers & Logarithmic Search Space",
    "Master Stack evaluations, Monotonic Stack, and Binary Search on sorted/rotated arrays and search space.",
    "Stack, Monotonic Stack, Binary Search, Rotated Search",
    "valid-parentheses, min-stack, evaluate-reverse-polish-notation, daily-temperatures, binary-search, search-a-2d-matrix, search-in-rotated-sorted-array",
    "search", "yellow", "https://neetcode.io/roadmap"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-neetcode-150", "NeetCode 150 Master Roadmap", "NeetCode (Navdeep Singh)",
    4, "Linked List & Trees (26 Problems)", "Pointers, Binary Trees & BST Properties",
    "Master LinkedList reversal, cycle detection, Binary Tree BFS/DFS, Diameter, Balanced Trees, and BST operations.",
    "Linked List, Binary Tree, BST, BFS, DFS, Tree Diameter",
    "reverse-linked-list, merge-two-sorted-lists, reorder-list, invert-binary-tree, maximum-depth-of-binary-tree, lowest-common-ancestor-of-a-binary-tree",
    "tool", "purple", "https://neetcode.io/roadmap"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-neetcode-150", "NeetCode 150 Master Roadmap", "NeetCode (Navdeep Singh)",
    5, "Graphs & Dynamic Programming (40 Problems)", "Graph Traversals, Topological Sort & DP Patterns",
    "Master Graph BFS/DFS, Connected Components, Topological Sort, 1D/2D DP, 0/1 Knapsack, Coin Change, and Longest Increasing Subsequence.",
    "Graph BFS/DFS, Topological Sort, 1D/2D DP, Knapsack, LIS",
    "number-of-islands, clone-graph, course-schedule, climbing-stairs, coin-change, longest-increasing-subsequence",
    "cloud", "indigo", "https://neetcode.io/roadmap"
)

# --- Love Babbar 450 DSA Cracker Roadmap ---
add_node(
    "Creator DSA Sheet Roadmap", "sheet-love-babbar", "Love Babbar 450 DSA Cracker Roadmap", "Love Babbar (CodeHelp)",
    1, "Arrays & Matrix Mastery", "40 Classic Array & Matrix Problems",
    "Reverse array, find min/max, Kth smallest element, sort 0s 1s 2s, Kadane's algorithm, Merge Intervals, and Matrix Spirals.",
    "Arrays, Sorting 0s 1s 2s, Kadane, Merge Intervals, Matrix Spiral",
    "reverse-the-array, find-the-maximum-and-minimum-element-in-an-array, sort-an-array-of-0s-1s-2s, kadanes-algorithm, merge-intervals",
    "code", "red", "https://codehelp.in"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-love-babbar", "Love Babbar 450 DSA Cracker Roadmap", "Love Babbar (CodeHelp)",
    2, "Strings, Searching & Sorting", "String Patterns & Binary Search",
    "Palindrome string, Count & Say, Print all Duplicates, Search in Rotated Array, Square Root, Majority Element.",
    "Strings, Palindromes, Binary Search Variants, Sorting",
    "reverse-a-string, palindrome-string, search-in-a-rotated-sorted-array, count-and-say",
    "search", "orange", "https://codehelp.in"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-love-babbar", "Love Babbar 450 DSA Cracker Roadmap", "Love Babbar (CodeHelp)",
    3, "LinkedList, Stack, Queue & Trees", "Linear & Tree Data Structures",
    "Reverse LinkedList, Detect Loop, Remove Loop, Next Greater Element, Reverse Queue, Height of Tree, Diameter of Tree.",
    "LinkedList, Stack, Queue, Binary Tree, BST",
    "reverse-a-linked-list, detect-loop-in-linked-list, next-greater-element, height-of-binary-tree",
    "tool", "purple", "https://codehelp.in"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-love-babbar", "Love Babbar 450 DSA Cracker Roadmap", "Love Babbar (CodeHelp)",
    4, "Greedy, Backtracking & Dynamic Programming", "Algorithmic Paradigms",
    "N Meetings in one room, Fractional Knapsack, N-Queens, Rat in a Maze, 0/1 Knapsack, Coin Change, LCS, Edit Distance.",
    "Greedy, Backtracking, 0/1 Knapsack, Coin Change, LCS, Edit Distance",
    "n-meetings-in-one-room, rat-in-a-maze-problem, 0-1-knapsack-problem, coin-change",
    "award", "green", "https://codehelp.in"
)

# --- Fraz SDE Sheet Roadmap ---
add_node(
    "Creator DSA Sheet Roadmap", "sheet-fraz-sde", "Fraz SDE Sheet Roadmap", "Mohammad Fraz",
    1, "Array & Hash Table Fundamentals", "Core High Frequency Warmups",
    "Master foundational array and hashing interview patterns recommended by Fraz for SDE preparation.",
    "Arrays, Hash Table, Two Pointers",
    "two-sum, 3sum, best-time-to-buy-and-sell-stock, move-zeroes",
    "code", "blue", "https://youtube.com/c/MohammadFraz"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-fraz-sde", "Fraz SDE Sheet Roadmap", "Mohammad Fraz",
    2, "Trees, Graphs & Dynamic Programming", "Advanced Coding Rounds",
    "Master non-linear data structures: Tree traversals, Graph BFS/DFS, and standard Dynamic Programming patterns.",
    "Binary Trees, Graph Traversal, Dynamic Programming",
    "number-of-islands, coin-change, lowest-common-ancestor-of-a-binary-tree",
    "cloud", "indigo", "https://youtube.com/c/MohammadFraz"
)

# --- Apna College Alpha DSA Roadmap ---
add_node(
    "Creator DSA Sheet Roadmap", "sheet-apna-college", "Apna College Alpha DSA Roadmap", "Apna College (Shraddha Khapra)",
    1, "Java Basics, Loops & Arrays", "Foundational Coding & Logic Building",
    "Learn Java fundamentals, conditional logic, loops, pattern printing, 1D and 2D arrays, and Basic Sorting.",
    "Java Syntax, Loops, Patterns, 1D/2D Arrays, Basic Sorting",
    "java-basics-variables, pattern-printing-1, bubble-sort, selection-sort",
    "code", "green", "https://apnacollege.in"
)
add_node(
    "Creator DSA Sheet Roadmap", "sheet-apna-college", "Apna College Alpha DSA Roadmap", "Apna College (Shraddha Khapra)",
    2, "Data Structures, Trees & Graphs", "Complete Alpha DSA Masterclass",
    "Master ArrayLists, LinkedList, Stacks, Queues, Binary Trees, BST, Heaps, Hashing, Tries, Graphs, and Dynamic Programming.",
    "ArrayList, LinkedList, Stack, Queue, Trees, Graphs, DP",
    "linked-list-cycle, binary-tree-traversal, graph-bfs-dfs, coin-change-dp",
    "tool", "teal", "https://apnacollege.in"
)

# Save to CSV files
os.makedirs(os.path.dirname(CSV_PATH_FRONTEND), exist_ok=True)

for path in [CSV_PATH_ROOT, CSV_PATH_FRONTEND]:
    with open(path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

print(f"Successfully generated {len(rows)} roadmap nodes across {path}!")
