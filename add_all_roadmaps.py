import json

with open('frontend/src/data/detailed_roadmaps_data.json', 'r', encoding='utf-8') as f:
    roadmaps = json.load(f)

existing_ids = {r['id'] for r in roadmaps}

more_roadmaps = [
    {
        "id": "role-intern",
        "category": "Role Roadmap",
        "title": "SDE Intern & Entry Level Roadmap",
        "creator": "GrindFam Curriculum",
        "description": "Complete beginner to intern roadmap: Programming fundamentals, math & warmups, core data structures, CS fundamentals (OS/DBMS/Networks), and resume OA prep.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Language & Syntax Fundamentals",
                "subtitle": "C++, Java, or Python Core Mastery",
                "description": "Master variables, conditional branching, loops, functions, and standard input/output formatting. Build logical clarity using pattern printing.",
                "guide": "### 1. Variables & Data Types\nUnderstand memory allocation for primitive data types (int, float, char, bool) vs reference types.\n\n### 2. Control Flow\nPractice if-else decision trees and loop constructs (for, while, do-while).",
                "codeSnippet": "# Python pattern printing example\nfor i in range(1, 6):\n    print('* ' * i)",
                "submodules": [
                    {"name": "Input/Output & Data Types", "status": "pending"},
                    {"name": "If-Else Control Flow & Switch Cases", "status": "pending"},
                    {"name": "Loops (For, While) & Pattern Printing", "status": "pending"},
                    {"name": "Functions & Pass-by-Value vs Reference", "status": "pending"}
                ],
                "interviewFaqs": [
                    "What is pass-by-value vs pass-by-reference in C++?",
                    "How does garbage collection work in Java?"
                ],
                "resources": [
                    {"type": "course", "label": "TakeUForward A2Z DSA Course", "url": "https://takeuforward.org/strivers-a2z-dsa-course/"}
                ],
                "topics": ["Syntax", "Input/Output", "Loops", "Pass-by-Reference", "Patterns"],
                "problems": ["pattern-square-star", "if-else-control-flow"],
                "icon": "code",
                "color": "blue",
                "sourceUrl": "https://takeuforward.org"
            },
            {
                "stepNumber": 2,
                "title": "Time & Space Complexity & Math Warmups",
                "subtitle": "Asymptotic Analysis, Big-O Notation & Basic Math",
                "description": "Understand Big-O time and space complexity analysis. Master basic math problems: count digits, reverse integer, palindrome check, GCD/LCM.",
                "guide": "### 1. Big-O Notation\n- O(1): Constant time\n- O(log N): Binary Search\n- O(N): Linear scan\n- O(N log N): Sorting (QuickSort/MergeSort)\n- O(N^2): Nested loops\n\n### 2. Basic Math Tricks\nEuclidean algorithm for GCD: `gcd(a, b) = gcd(b, a % b)`.",
                "codeSnippet": "def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a",
                "submodules": [
                    {"name": "Big-O Asymptotic Time & Space Analysis", "status": "pending"},
                    {"name": "Count Digits, Reverse Number & Palindrome Check", "status": "pending"},
                    {"name": "Armstrong Numbers & Prime Factorization", "status": "pending"},
                    {"name": "GCD / LCM with Euclidean Algorithm", "status": "pending"}
                ],
                "interviewFaqs": [
                    "What is the time complexity of the Euclidean GCD algorithm?",
                    "Explain worst case vs average case time complexity."
                ],
                "resources": [
                    {"type": "docs", "label": "LeetCode Discussion — Math Tricks", "url": "https://leetcode.com"}
                ],
                "topics": ["Big-O", "Time Complexity", "Space Complexity", "GCD", "Prime"],
                "problems": ["count-digits", "reverse-integer", "palindrome-number"],
                "icon": "zap",
                "color": "yellow",
                "sourceUrl": "https://leetcode.com"
            }
        ]
    },
    {
        "id": "role-senior-sde",
        "category": "Role Roadmap",
        "title": "Senior / Lateral SDE Track Roadmap",
        "creator": "GrindFam Curriculum",
        "description": "Advanced algorithmic patterns, Object-Oriented Design (LLD), System Architecture (HLD), leadership principles, and salary negotiation.",
        "steps": [
            {
                "stepNumber": 1,
                "title": "Advanced Algorithms & Hard Patterns",
                "subtitle": "Hard DP, Disjoint Set Union (DSU) & Segment Trees",
                "description": "Solve complex algorithmic problems involving Monotonic Queues, Disjoint Set Union (DSU), Segment Trees, Hard DP, and Tries.",
                "guide": "### 1. Disjoint Set Union (DSU)\nDSU supports near O(1) union and find operations using Path Compression and Union by Rank.",
                "codeSnippet": "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n    def find(self, i):\n        if self.parent[i] == i:\n            return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n    def union(self, i, j):\n        root_i, root_j = self.find(i), self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] < self.rank[root_j]:\n                root_i, root_j = root_j, root_i\n            self.parent[root_j] = root_i\n            if self.rank[root_i] == self.rank[root_j]:\n                self.rank[root_i] += 1",
                "submodules": [
                    {"name": "Disjoint Set Union (DSU) with Path Compression", "status": "pending"},
                    {"name": "Segment Trees & Fenwick Trees (Binary Indexed Tree)", "status": "pending"},
                    {"name": "Monotonic Stack / Queue Patterns", "status": "pending"},
                    {"name": "Hard Dynamic Programming: Bitmask DP & Tree DP", "status": "pending"}
                ],
                "interviewFaqs": [
                    "How does Path Compression achieve near O(1) amortized time in DSU?",
                    "When would you choose a Segment Tree over a Binary Indexed Tree?"
                ],
                "resources": [
                    {"type": "docs", "label": "CP-Algorithms — Advanced Data Structures", "url": "https://cp-algorithms.com/"}
                ],
                "topics": ["DSU", "Segment Tree", "Monotonic Queue", "Hard DP", "Trie"],
                "problems": ["trapping-rain-water", "sliding-window-maximum", "merge-k-sorted-lists"],
                "icon": "zap",
                "color": "red",
                "sourceUrl": "https://leetcode.com"
            },
            {
                "stepNumber": 2,
                "title": "Low-Level Design (LLD) & Object-Oriented",
                "subtitle": "SOLID Principles & Design Patterns (Factory, Strategy, Observer)",
                "description": "Master SOLID principles, Object-Oriented Analysis and Design (OOAD), UML Class Diagrams, and Design Patterns.",
                "guide": "### 1. SOLID Principles\n- **Single Responsibility**: One class = one reason to change\n- **Open/Closed**: Open for extension, closed for modification\n- **Liskov Substitution**: Subtypes must be substitutable for base types\n- **Interface Segregation**: Lean interfaces\n- **Dependency Inversion**: Depend on abstractions, not concretions",
                "codeSnippet": "// Strategy Pattern in TypeScript\ninterface PaymentStrategy {\n  pay(amount: number): void;\n}\nclass CreditCardPayment implements PaymentStrategy {\n  pay(amount: number) { console.log(`Paid ${amount} via Credit Card`); }\n}",
                "submodules": [
                    {"name": "SOLID Principles with Code Examples", "status": "pending"},
                    {"name": "Creational Patterns: Factory, Abstract Factory, Singleton, Builder", "status": "pending"},
                    {"name": "Structural Patterns: Adapter, Decorator, Facade, Proxy", "status": "pending"},
                    {"name": "Behavioral Patterns: Strategy, Observer, Command, State", "status": "pending"},
                    {"name": "Design LRU Cache / LFU Cache / Parking Lot / Elevator System", "status": "pending"}
                ],
                "interviewFaqs": [
                    "Explain the Strategy Pattern with a real-world payment gateway example.",
                    "How do you design a thread-safe Singleton in Java or C++?"
                ],
                "resources": [
                    {"type": "docs", "label": "Refactoring Guru — Design Patterns", "url": "https://refactoring.guru/design-patterns"}
                ],
                "topics": ["SOLID", "Design Patterns", "LLD", "UML", "OOAD"],
                "problems": ["design-lru-cache", "design-parking-lot", "design-elevator-system"],
                "icon": "tool",
                "color": "purple",
                "sourceUrl": "https://refactoring.guru"
            },
            {
                "stepNumber": 3,
                "title": "High-Level Design (HLD) & Distributed Systems",
                "subtitle": "Scalability, Caching, DB Sharding & Message Queues",
                "description": "Learn to architect large-scale distributed systems: Load Balancers, API Gateways, Caching, Database Sharding, and Kafka.",
                "guide": "### 1. Key System Design Pillars\n- **Scalability**: Load Balancers + Stateless App Tier + Database Read Replicas\n- **Availability**: Multi-region deployment + Automatic Failover (Patroni)\n- **Reliability**: Message Queues (Kafka/RabbitMQ) for asynchronous processing",
                "codeSnippet": "# System Design Blueprint: URL Shortener\n1. Client -> API Gateway (Rate Limiter)\n2. API Gateway -> Hash Service (Nanoid Base62)\n3. Cache Check -> Redis (Hit: return 302)\n4. DB Check -> PostgreSQL (Miss: write to Redis & return 302)",
                "submodules": [
                    {"name": "Load Balancing & Rate Limiting Algorithms", "status": "pending"},
                    {"name": "Distributed Caching Strategies & Redis Cluster", "status": "pending"},
                    {"name": "Database Sharding & Consistent Hashing", "status": "pending"},
                    {"name": "Asynchronous Task Queues with Kafka & RabbitMQ", "status": "pending"}
                ],
                "interviewFaqs": [
                    "How would you design Twitter's timeline feed for 500M active users?",
                    "Explain the trade-offs between SQL sharding and NoSQL DynamoDB."
                ],
                "resources": [
                    {"type": "course", "label": "ByteByteGo System Design", "url": "https://bytebytego.com/"}
                ],
                "topics": ["HLD", "System Design", "Distributed Systems", "Kafka", "Sharding"],
                "problems": ["design-url-shortener", "design-whatsapp", "design-notification-service"],
                "icon": "database",
                "color": "green",
                "sourceUrl": "https://bytebytego.com"
            }
        ]
    }
]

added_count = 0
for r in more_roadmaps:
    if r['id'] not in existing_ids:
        roadmaps.append(r)
        added_count += 1

print(f"Added {added_count} more roadmaps!")
print("Total roadmaps count now:", len(roadmaps))

with open('frontend/src/data/detailed_roadmaps_data.json', 'w', encoding='utf-8') as f:
    json.dump(roadmaps, f, indent=2)

print("Successfully updated detailed_roadmaps_data.json!")
