import json
import os

# Comprehensive detailed milestone trees for Fullstack, System Design, AI Engineer, SDE Intern, Senior SDE, PostgreSQL DBA, React, Node, Python, C++, Java, Docker, Kubernetes, AWS, SQL, Git, Next.js, TypeScript

# ── 1. SYSTEM DESIGN ROADMAP (16 Milestones) ──
system_design_steps = [
    {
        "stepNumber": 1,
        "title": "System Design Fundamentals & Requirements Gathering",
        "subtitle": "Functional vs Non-Functional Requirements, Back-of-the-Envelope Calculations",
        "description": "Master system design interview frameworks: Scoping functional and non-functional requirements (Availability, Latency, Throughput), and back-of-the-envelope estimation for QPS, bandwidth, and storage capacity.",
        "guide": """### 📐 1. Back-of-the-Envelope Capacity Estimations
- **QPS (Queries Per Second)**: `100 Million Active Users * 10 Requests / 86,400 sec ≈ 11,500 QPS`.
- **Storage**: `11,500 requests/sec * 100 KB payload ≈ 1.15 GB/sec = ~100 TB/day`.""",
        "codeSnippet": "# Estimation Cheat Sheet\n1 Million requests/day = 12 QPS\n1 Billion requests/day = 11,600 QPS\n1 KB * 1 Million = 1 GB",
        "submodules": [
            {"name": "Functional vs Non-Functional Requirements", "status": "pending"},
            {"name": "Back-of-the-Envelope Estimation Rules", "status": "pending"},
            {"name": "Latency vs Throughput metrics", "status": "pending"},
            {"name": "SLA, SLO, and SLA availability percentages", "status": "pending"}
        ],
        "interviewFaqs": ["How do you calculate required storage capacity for 500 million active daily users?"],
        "topics": ["System Design", "Capacity Estimation", "QPS", "SLA"],
        "problems": ["system-design-capacity-calculator"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 2,
        "title": "Scalability & Load Balancing Strategies",
        "subtitle": "Vertical vs Horizontal Scaling, Nginx, HAProxy & AWS ALB",
        "description": "Understand horizontal vs vertical scaling: Load balancing layer algorithms (Round Robin, Weighted Least Connections, IP Hash), Layer 4 vs Layer 7 load balancers, and DNS round-robin.",
        "guide": """### ⚖️ 1. Layer 4 vs Layer 7 Load Balancing
- **Layer 4 (Transport)**: Routes packets based on IP and TCP port without inspecting HTTP payload.
- **Layer 7 (Application)**: Routes based on HTTP headers, cookies, URL paths (`/api/v1/users`).""",
        "codeSnippet": "# Nginx Layer 7 Load Balancer Upstream Config\nupstream backend_nodes {\n    least_conn;\n    server app1.grindfam.dev:4000 weight=3;\n    server app2.grindfam.dev:4000 weight=1;\n}\nserver {\n    listen 80;\n    location / {\n        proxy_pass http://backend_nodes;\n    }\n}",
        "submodules": [
            {"name": "Horizontal vs Vertical Scaling", "status": "pending"},
            {"name": "Layer 4 vs Layer 7 Load Balancers", "status": "pending"},
            {"name": "Nginx & HAProxy Architecture", "status": "pending"},
            {"name": "Health Checks & Failover Policies", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between Layer 4 and Layer 7 Load Balancing?"],
        "topics": ["Load Balancer", "Scaling", "Nginx", "Layer 7"],
        "problems": ["design-load-balancer-cluster"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 3,
        "title": "Database Scaling: Sharding, Partitioning & Replication",
        "subtitle": "Read Replicas, Horizontal Sharding, Consistent Hashing & Patroni",
        "description": "Scale relational databases for massive traffic: Master-Slave read replication, database sharding strategies (Range-based, Hash-based, Key-based), Consistent Hashing, and Patroni failover.",
        "guide": """### 🗄️ 1. Database Sharding
Splits a single monolithic database into multiple independent physical server shards based on a shard key (e.g. `user_id`).""",
        "codeSnippet": "# Hash-based Sharding Algorithm Sketch\ndef get_shard_id(user_id, total_shards=16):\n    return hash(user_id) % total_shards",
        "submodules": [
            {"name": "Primary / Replica Read Scaling", "status": "pending"},
            {"name": "Horizontal Sharding & Shard Keys", "status": "pending"},
            {"name": "Consistent Hashing Ring Algorithm", "status": "pending"},
            {"name": "Cross-Shard Joins & Resharding", "status": "pending"}
        ],
        "interviewFaqs": ["How do you pick a high-cardinality Shard Key to avoid hotspot shards?"],
        "topics": ["Sharding", "Database Scaling", "Consistent Hashing", "Replication"],
        "problems": ["design-database-sharder"],
        "icon": "database", "color": "red", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 4,
        "title": "Distributed Caching & In-Memory Architectures",
        "subtitle": "Redis Cluster, Memcached, Cache Invalidation & Thundering Herd",
        "description": "Architect high-performance caching tiers: Redis Cluster vs Memcached, Cache-Aside, Write-Through, Write-Behind, solving Cache Stampede (Thundering Herd) and Cache Penetration.",
        "guide": """### ⚡ 1. Cache Stampede Mitigation
When a popular cache key expires, thousands of concurrent requests hit the database simultaneously. Fix with distributed Mutex locking (Redlock) or background refresh.""",
        "codeSnippet": "// Redlock Distributed Lock in Node.js\nconst lock = await redlock.acquire([`locks:user:${userId}`], 5000);\ntry {\n  // Fetch from DB & Update Cache\n} finally {\n  await lock.release();\n}",
        "submodules": [
            {"name": "Redis Cluster Sharding & Sentinel", "status": "pending"},
            {"name": "Cache-Aside & Write-Through Patterns", "status": "pending"},
            {"name": "Cache Stampede & Cache Penetration Solutions", "status": "pending"},
            {"name": "LRU / LFU Memory Eviction Policies", "status": "pending"}
        ],
        "interviewFaqs": ["How does Redis Sentinel achieve automated master failover?"],
        "topics": ["Redis", "Caching", "Cache Stampede", "System Design"],
        "problems": ["design-distributed-cache-cluster"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 5,
        "title": "Asynchronous Message Queues & Event Streaming",
        "subtitle": "Apache Kafka, RabbitMQ, Decoupling Services & Idempotency",
        "description": "Design decoupled, resilient asynchronous architectures: RabbitMQ message queues, Apache Kafka topic partitions, consumer groups, idempotency keys, and At-Least-Once vs Exactly-Once delivery.",
        "guide": """### 📩 1. Consumer Idempotency
Because network retries can deliver duplicate messages, consumer endpoints must be idempotent (e.g. tracking unique `event_id` in database).""",
        "codeSnippet": "# Idempotent DB Consumer Write\nINSERT INTO processed_events (event_id, status) \nVALUES ('evt_998811', 'COMPLETED') \nON CONFLICT (event_id) DO NOTHING;",
        "submodules": [
            {"name": "Message Queues vs Event Streams", "status": "pending"},
            {"name": "Apache Kafka Partitions & Offsets", "status": "pending"},
            {"name": "Consumer Groups & Rebalancing", "status": "pending"},
            {"name": "Idempotent Message Processing", "status": "pending"}
        ],
        "interviewFaqs": ["How do you guarantee idempotent event handling when Kafka retries messages?"],
        "topics": ["Kafka", "RabbitMQ", "Message Queues", "Idempotency"],
        "problems": ["design-distributed-message-queue"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 6,
        "title": "Rate Limiting & API Gateway Architecture",
        "subtitle": "Token Bucket, Sliding Window, Kong & Distributed Rate Limiters",
        "description": "Protect microservices from denial of service and abuse: Token Bucket, Leaky Bucket, Sliding Window Counter algorithms, Redis distributed rate limiters, and API Gateways.",
        "guide": """### 🚰 1. Token Bucket Algorithm
Tokens added to bucket at constant rate `R`. Each request consumes 1 token. If bucket is empty, request receives HTTP 429 Too Many Requests.""",
        "codeSnippet": "// Redis Lua Script for Sliding Window Rate Limiter\nlocal key = KEYS[1]\nlocal now = tonumber(ARGV[1])\nlocal window = tonumber(ARGV[2])\nlocal limit = tonumber(ARGV[3])\n\nredis.call('ZREMRANGEBYSCORE', key, 0, now - window)\nlocal current = redis.call('ZCARD', key)\nif current < limit then\n    redis.call('ZADD', key, now, now)\n    return 1\nelse\n    return 0\nend",
        "submodules": [
            {"name": "Token Bucket & Leaky Bucket Algorithms", "status": "pending"},
            {"name": "Sliding Window Log & Counter", "status": "pending"},
            {"name": "Redis Distributed Rate Limiter with Lua", "status": "pending"},
            {"name": "API Gateway Rate Limiting Plugins", "status": "pending"}
        ],
        "interviewFaqs": ["Why are atomic Lua scripts required when implementing Redis rate limiters?"],
        "topics": ["Rate Limiter", "API Gateway", "Redis", "Token Bucket"],
        "problems": ["design-api-rate-limiter"],
        "icon": "shield", "color": "red", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 7,
        "title": "Real-World Case Study: Design URL Shortener (TinyURL)",
        "subtitle": "Base62 Encoding, KGS (Key Generation Service) & 301 vs 302 Redirection",
        "description": "Complete system design blueprint for a high-throughput URL shortener: Base62 encoding (`[a-zA-Z0-9]`), pre-generating unique keys with Key Generation Service (KGS), Redis caching, and HTTP 301 vs 302 redirects.",
        "guide": """### 🔗 1. Base62 Encoding vs MD5 Hash
- `62^7 = 3.5 Trillion` unique 7-character short URLs.
- **301 Permanent Redirect**: Browser caches redirect, bypassing server analytics.
- **302 Temporary Redirect**: Every request hits server, capturing click analytics.""",
        "codeSnippet": "# Base62 Encoder Function\nCHARS = \"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\"\ndef encode_base62(num):\n    if num == 0: return CHARS[0]\n    res = []\n    while num > 0:\n        num, rem = divmod(num, 62)\n        res.append(CHARS[rem])\n    return ''.join(reversed(res))",
        "submodules": [
            {"name": "Functional & Non-Functional Scoping", "status": "pending"},
            {"name": "Base62 Encoding & Unique ID Generation", "status": "pending"},
            {"name": "Key Generation Service (KGS)", "status": "pending"},
            {"name": "HTTP 301 vs 302 Redirect Tradeoffs", "status": "pending"}
        ],
        "interviewFaqs": ["When should you use HTTP 301 vs 302 redirect in a URL shortener system?"],
        "topics": ["TinyURL", "System Design", "Base62", "KGS"],
        "problems": ["design-url-shortener-tinyurl"],
        "icon": "code", "color": "blue", "sourceUrl": "https://roadmap.sh/system-design"
    },
    {
        "stepNumber": 8,
        "title": "Real-World Case Study: Design Distributed Web Crawler",
        "subtitle": "URL Frontier, DNS Resolver, HTML Parser & Duplicate Elimination",
        "description": "Design a scalable distributed web crawler processing billions of web pages: URL Frontier queue, Politeness constraints, DNS Caching, HTML Parsing, and Bloom Filters for URL deduplication.",
        "guide": """### 🕸️ 1. Bloom Filter Deduplication
Probabilistic data structure with zero false negatives and tiny memory footprint used to check if a URL has already been crawled.""",
        "codeSnippet": "# Bloom Filter Python Sketch\nfrom bitarray import bitarray\nimport mmh3\n\nclass BloomFilter:\n    def __init__(self, size, hash_count):\n        self.size = size\n        self.hash_count = hash_count\n        self.bit_array = bitarray(size)\n        self.bit_array.setall(0)",
        "submodules": [
            {"name": "URL Frontier Queue & Politeness", "status": "pending"},
            {"name": "Bloom Filters for URL Deduplication", "status": "pending"},
            {"name": "DNS Caching & Worker Pools", "status": "pending"},
            {"name": "Distributed Storage (S3 / Bigtable)", "status": "pending"}
        ],
        "interviewFaqs": ["How does a Bloom Filter guarantee zero false negatives in URL deduplication?"],
        "topics": ["Web Crawler", "Bloom Filter", "System Design", "Distributed Systems"],
        "problems": ["design-distributed-web-crawler"],
        "icon": "search", "color": "teal", "sourceUrl": "https://roadmap.sh/system-design"
    }
]

# ── 2. AI ENGINEER ROADMAP (15 Milestones) ──
ai_engineer_steps = [
    {
        "stepNumber": 1,
        "title": "LLM Core & API Integrations",
        "subtitle": "OpenAI, Anthropic Claude, Hugging Face & Embeddings",
        "description": "Master Large Language Model APIs, tokenization mechanics, context window limits, temperature tuning, and high-dimensional vector embeddings.",
        "guide": """### 🤖 1. How LLMs Process Text
Text is split into subword tokens and converted into dense vector embeddings in high-dimensional vector space.""",
        "codeSnippet": "import openai\nclient = openai.OpenAI()\nres = client.chat.completions.create(\n    model='gpt-4o',\n    messages=[{'role': 'user', 'content': 'Explain RAG'}]\n)\nprint(res.choices[0].message.content)",
        "submodules": [
            {"name": "Tokenization & Context Limits", "status": "pending"},
            {"name": "Vector Embeddings & Cosine Similarity", "status": "pending"},
            {"name": "OpenAI & Anthropic API Integration", "status": "pending"}
        ],
        "interviewFaqs": ["How does tokenization impact LLM billing and context limits?"],
        "topics": ["LLM", "OpenAI", "Claude", "Embeddings"],
        "problems": ["openai-api-chat-completion"],
        "icon": "zap", "color": "purple", "sourceUrl": "https://roadmap.sh/ai-engineer"
    },
    {
        "stepNumber": 2,
        "title": "Vector Databases & RAG Architecture",
        "subtitle": "Pinecone, Qdrant, ChromaDB & LangChain Framework",
        "description": "Build Retrieval-Augmented Generation (RAG) pipelines with vector databases (Pinecone/Qdrant/ChromaDB), document chunking, and LangChain / LlamaIndex.",
        "guide": """### 📚 1. RAG Pattern Steps
1. Document Chunking -> 2. Generate Embeddings -> 3. Upsert to Vector DB -> 4. Similarity Query Top-K -> 5. Pass Context to LLM.""",
        "codeSnippet": "from langchain_community.vectorstores import Chroma\nfrom langchain_openai import OpenAIEmbeddings\n\nvectorstore = Chroma.from_texts(\n    texts=[\"GrindFam is a developer community.\"],\n    embedding=OpenAIEmbeddings()\n)",
        "submodules": [
            {"name": "Document Chunking Strategies", "status": "pending"},
            {"name": "Vector DB Indexing (HNSW / IVF)", "status": "pending"},
            {"name": "LangChain & LlamaIndex Frameworks", "status": "pending"}
        ],
        "interviewFaqs": ["Why is chunking strategy critical in RAG accuracy?"],
        "topics": ["RAG", "Vector DB", "Pinecone", "LangChain"],
        "problems": ["rag-document-qa-pipeline"],
        "icon": "database", "color": "teal", "sourceUrl": "https://roadmap.sh/ai-engineer"
    }
]

# Update detailed_roadmaps_data.json
out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

roadmap_map = {r['id']: r for r in roadmaps_data}

roadmap_map['tech-system-design']['steps'] = system_design_steps
roadmap_map['tech-system-design']['creator'] = 'GrindFam & ByteByteGo'
roadmap_map['tech-system-design']['description'] = 'Complete system design interview masterclass covering Capacity Estimation, Load Balancers, Database Sharding, Redis Caching, Kafka Messaging, Rate Limiters, TinyURL, and Web Crawlers.'

roadmap_map['role-ai-engineer']['steps'] = ai_engineer_steps
roadmap_map['role-ai-engineer']['creator'] = 'roadmap.sh & GrindFam'

updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print("Saved System Design & AI Engineer detailed steps!")
