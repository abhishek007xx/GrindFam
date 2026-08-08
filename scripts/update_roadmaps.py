import json
import os

# Script to enrich detailed_roadmaps_data.json with 20+ milestone step trees per role

from build_frontend_roadmap import frontend_steps

backend_steps = [
    {
        "stepNumber": 1,
        "title": "Internet & Networking Fundamentals",
        "subtitle": "HTTP/HTTPS, TCP/IP, UDP, DNS, TLS & Sockets",
        "description": "Understand core networking principles powering modern backends: OSI model layers, TCP three-way handshake, UDP datagrams, HTTP headers, and socket programming.",
        "guide": """### 🌐 1. TCP vs UDP Protocols
- **TCP**: Connection-oriented, reliable, ordered packet delivery with error checking (Web APIs, SSH, Email).
- **UDP**: Connectionless, low-latency, unordered delivery without delivery guarantees (Video streaming, Gaming, DNS).

### 🔒 2. TLS / SSL Encryption Handshake
Symmetric encryption (AES) for payload transfer using asymmetric public/private keys (RSA/ECC) established during handshaking.""",
        "codeSnippet": "// Basic Node.js HTTP Server\nconst http = require('http');\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));\n});\nserver.listen(4000);",
        "submodules": [
            {"name": "How does the internet work?", "status": "pending"},
            {"name": "HTTP / HTTPS & HTTP/2 & HTTP/3", "status": "pending"},
            {"name": "TCP / IP vs UDP Protocols", "status": "pending"},
            {"name": "DNS Resolution Mechanics", "status": "pending"},
            {"name": "Sockets & WebSockets Protocols", "status": "pending"}
        ],
        "interviewFaqs": ["Explain TCP 3-way handshake (SYN, SYN-ACK, ACK).", "What is the difference between TCP and UDP?"],
        "topics": ["Networking", "HTTP", "TCP", "UDP", "Sockets"],
        "problems": ["socket-client-server-implementation"],
        "icon": "globe", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 2,
        "title": "OS & General Programming Concepts",
        "subtitle": "Processes, Threads, Concurrency, Memory Management & I/O Calls",
        "description": "Master operating system fundamentals: Process management, multithreading, concurrency vs parallelism, blocking vs non-blocking I/O calls, and memory management.",
        "guide": """### ⚙️ 1. Processes vs Threads
- **Process**: Independent execution environment with isolated virtual memory space.
- **Thread**: Lightweight execution unit sharing parent process memory address space.

### 🔄 2. Non-blocking Async I/O
Async I/O delegates OS disk/network calls to background worker pools (libuv/epoll) notifying main event loops upon completion.""",
        "codeSnippet": "# Python Multiprocessing vs Threading\nfrom concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor\n\ndef worker(x):\n    return x * x\n\nwith ThreadPoolExecutor(max_workers=4) as executor:\n    results = list(executor.map(worker, range(10)))",
        "submodules": [
            {"name": "Process Management & Lifecycle", "status": "pending"},
            {"name": "Threads & Multithreading", "status": "pending"},
            {"name": "Concurrency vs Parallelism", "status": "pending"},
            {"name": "Blocking vs Non-Blocking I/O", "status": "pending"},
            {"name": "POSIX File Systems & Signals", "status": "pending"}
        ],
        "interviewFaqs": ["What is a deadlock and what are the 4 Coffman conditions required for it?", "Compare OS Process vs Thread."],
        "topics": ["OS", "Threads", "Processes", "Concurrency", "I/O"],
        "problems": ["producer-consumer-mutex-queue"],
        "icon": "terminal", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 3,
        "title": "Pick a Backend Language",
        "subtitle": "Node.js / TypeScript, Python, Java, Go, Rust, or C#",
        "description": "Deeply master your core backend programming language: memory model, package management, async execution model, and concurrency primitives.",
        "guide": """### 🟢 Node.js / TypeScript
Single-threaded event-driven event loop architecture using libuv for asynchronous I/O.

### 🐍 Python
Dynamic, high-level language with asyncio event loops and GIL (Global Interpreter Lock).

### 🔷 Go (Golang)
Statically typed compiled language with lightweight goroutines (M:N scheduler) and channels.""",
        "codeSnippet": "// Go Goroutine Concurrent Worker\npackage main\nimport (\"fmt\"; \"sync\")\nfunc main() {\n    var wg sync.WaitGroup\n    wg.Add(1)\n    go func() {\n        defer wg.Done()\n        fmt.Println(\"Worker running in Goroutine\")\n    }()\n    wg.Wait()\n}",
        "submodules": [
            {"name": "Node.js / JavaScript / TypeScript", "status": "pending"},
            {"name": "Python (FastAPI / Django)", "status": "pending"},
            {"name": "Go (Golang)", "status": "pending"},
            {"name": "Java (Spring Boot)", "status": "pending"},
            {"name": "Rust (Actix / Axum)", "status": "pending"}
        ],
        "interviewFaqs": ["How does Go scheduler manage thousands of Goroutines efficiently?", "What is Python GIL?"],
        "topics": ["Node.js", "Python", "Go", "Java", "Backend Languages"],
        "problems": ["concurrent-web-crawler-go"],
        "icon": "code", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 4,
        "title": "Relational Databases (RDBMS)",
        "subtitle": "PostgreSQL, MySQL, SQL Queries, Joins, Indexing & ACID Transactions",
        "description": "Master relational database architecture: SQL DDL/DML queries, complex INNER/LEFT/OUTER joins, ACID transaction guarantees, and indexing.",
        "guide": """### 🗄️ 1. ACID Guarantees
- **Atomicity**: Transactions commit completely or roll back entirely.
- **Consistency**: Data adheres to schema constraints (FK, Unique, Check).
- **Isolation**: Concurrent transactions execute without mutual interference.
- **Durability**: Committed data persists to non-volatile disk storage (WAL).

### ⚡ 2. B-Tree Indexes
B-Tree indexes speed up `WHERE`, `JOIN`, and `ORDER BY` lookups from O(N) linear scans to O(log N) tree traversals.""",
        "codeSnippet": "-- SQL Transaction with Row-Level Locking\nBEGIN;\nSELECT balance FROM accounts WHERE user_id = 101 FOR UPDATE;\nUPDATE accounts SET balance = balance - 100 WHERE user_id = 101;\nUPDATE accounts SET balance = balance + 100 WHERE user_id = 202;\nCOMMIT;",
        "submodules": [
            {"name": "PostgreSQL & MySQL Databases", "status": "pending"},
            {"name": "SQL Data Types & Normalization (1NF to 3NF)", "status": "pending"},
            {"name": "Complex SQL Queries & Joins", "status": "pending"},
            {"name": "ACID Properties & Transactions", "status": "pending"},
            {"name": "B-Tree Indexes & EXPLAIN ANALYZE", "status": "pending"}
        ],
        "interviewFaqs": ["Explain Database Normalization up to 3NF.", "What is the difference between B-Tree index and Hash Index?"],
        "topics": ["PostgreSQL", "MySQL", "SQL", "ACID", "Indexes"],
        "problems": ["sql-bank-account-transfer-transaction"],
        "icon": "database", "color": "red", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 5,
        "title": "NoSQL Databases",
        "subtitle": "MongoDB, Redis, Cassandra, Key-Value vs Document vs Column",
        "description": "Learn when and how to choose non-relational database storage: Document stores (MongoDB), In-memory Key-Value caches (Redis), Columnar (Cassandra), and Graph databases (Neo4j).",
        "guide": """### 📑 1. Document Stores vs Key-Value
- **Document (MongoDB)**: Stores flexible JSON-like BSON documents with dynamic schemas and embedded subdocuments.
- **Key-Value (Redis)**: Ultra-fast in-memory data store supporting Strings, Hashes, Lists, Sets, and Sorted Sets (ZSET).

### 📐 2. CAP Theorem
In a distributed system, you can choose at most 2 out of 3 guarantees: Consistency, Availability, Partition Tolerance.""",
        "codeSnippet": "# Redis Sorted Set Leaderboard Operations\nZADD leaderboard 1500 'user_42'\nZADD leaderboard 2100 'user_99'\n\n# Get top 10 users with scores\nZREVRANGE leaderboard 0 9 WITHSCORES",
        "submodules": [
            {"name": "MongoDB Document Database", "status": "pending"},
            {"name": "Redis In-Memory Key-Value Store", "status": "pending"},
            {"name": "Apache Cassandra (Column-Family)", "status": "pending"},
            {"name": "CAP Theorem & PACELC Theorem", "status": "pending"}
        ],
        "interviewFaqs": ["Explain CAP Theorem with real-world database examples.", "When would you prefer MongoDB over PostgreSQL?"],
        "topics": ["MongoDB", "Redis", "NoSQL", "CAP Theorem", "Databases"],
        "problems": ["redis-rate-limiter-sliding-window"],
        "icon": "database", "color": "red", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 6,
        "title": "API Design & Architecture Paradigms",
        "subtitle": "REST APIs, GraphQL, gRPC & WebSockets",
        "description": "Design clean, scalable backend API interfaces: RESTful resource endpoints, GraphQL schemas, high-performance binary gRPC (Protobuf), and real-time WebSockets.",
        "guide": """### 🛠️ 1. RESTful API Principles
Use standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), status codes, and URI nouns (`/api/v1/users/42/orders`).

### ⚡ 2. gRPC & Protocol Buffers
High-performance RPC framework developed by Google over HTTP/2 using binary Protocol Buffers for minimal payload size and low latency.""",
        "codeSnippet": "// Protocol Buffer Schema (.proto)\nsyntax = \"proto3\";\n\nservice UserService {\n  rpc GetUser (UserRequest) returns (UserResponse);\n}\n\nmessage UserRequest {\n  string user_id = 1;\n}\nmessage UserResponse {\n  string name = 1;\n  string email = 2;\n}",
        "submodules": [
            {"name": "REST API Best Practices & OpenAPI/Swagger", "status": "pending"},
            {"name": "GraphQL Schemas & Resolvers", "status": "pending"},
            {"name": "gRPC & Protocol Buffers (Protobuf)", "status": "pending"},
            {"name": "WebSockets & Server-Sent Events (SSE)", "status": "pending"}
        ],
        "interviewFaqs": ["Compare REST vs GraphQL vs gRPC.", "How does HTTP/2 multiplexing benefit gRPC streams?"],
        "topics": ["REST", "GraphQL", "gRPC", "Protobuf", "APIs"],
        "problems": ["grpc-user-service-protobuf"],
        "icon": "code", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 7,
        "title": "Caching Strategies & In-Memory Stores",
        "subtitle": "Redis, Memcached, Cache-Aside, Write-Through & Invalidation",
        "description": "Accelerate backend API response times with caching: Cache-Aside pattern, Write-Through/Write-Behind caching, TTL expiration policies, and cache invalidation strategies.",
        "guide": """### ⚡ 1. Caching Strategies
- **Cache-Aside (Lazy Loading)**: Read from Cache -> If Miss, Read DB -> Write to Cache.
- **Write-Through**: Write to Cache and DB synchronously.
- **Write-Behind (Write-Back)**: Write to Cache -> Async queue flushes to DB.

### 💥 2. Cache Invalidation Gotchas
- **Cache Stampede (Thundering Herd)**: Simultaneous cache expiration triggers burst of DB queries. Mitigate with Mutex locks or early refresh.""",
        "codeSnippet": "// Cache-Aside Pattern in Node.js with Redis\nasync function getCachedUser(userId) {\n  const cached = await redis.get(`user:${userId}`);\n  if (cached) return JSON.parse(cached);\n  \n  const user = await db.findUser(userId);\n  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));\n  return user;\n}",
        "submodules": [
            {"name": "Redis In-Memory Caching", "status": "pending"},
            {"name": "Memcached Architecture", "status": "pending"},
            {"name": "Cache-Aside & Write-Through Patterns", "status": "pending"},
            {"name": "Cache Invalidation & Eviction (LRU/LFU)", "status": "pending"}
        ],
        "interviewFaqs": ["How do you solve Cache Stampede and Cache Penetration?", "Compare Cache-Aside vs Write-Through strategies."],
        "topics": ["Redis", "Caching", "Cache-Aside", "LRU", "Performance"],
        "problems": ["lru-cache-implementation-redis"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 8,
        "title": "Authentication & Authorization Security",
        "subtitle": "JWT Tokens, OAuth2, SAML, RBAC & Password Hashing (Bcrypt/Argon2)",
        "description": "Secure backend services: Password hashing with Argon2/Bcrypt, stateless JWT verification, OAuth 2.0 / OpenID Connect authorization flows, Role-Based Access Control (RBAC), and Attribute-Based Access Control (ABAC).",
        "guide": """### 🔐 1. Password Hashing
Never store plain-text passwords. Use key-stretching salted hash algorithms: Argon2id or Bcrypt with high cost factor.

### 🛡️ 2. Role-Based Access Control (RBAC)
Associate roles (Admin, Member, Guest) with granular permissions (`posts:create`, `users:delete`).""",
        "codeSnippet": "# Python Bcrypt Password Hashing\nimport bcrypt\n\npassword = b'super_secret_password'\nhashed = bcrypt.hashpw(password, bcrypt.gensalt(12))\n\n# Verification\nif bcrypt.checkpw(password, hashed):\n    print('Password Match!')",
        "submodules": [
            {"name": "Password Hashing (Argon2 / Bcrypt)", "status": "pending"},
            {"name": "JWT Token Verification & Rotation", "status": "pending"},
            {"name": "OAuth 2.0 & OIDC Authorization Code Flow", "status": "pending"},
            {"name": "Role-Based Access Control (RBAC)", "status": "pending"}
        ],
        "interviewFaqs": ["Why should you use Argon2/Bcrypt over MD5 or SHA256 for password storage?", "How does OAuth 2.0 PKCE prevent auth code interception?"],
        "topics": ["Auth", "JWT", "OAuth2", "Bcrypt", "RBAC", "Security"],
        "problems": ["rbac-middleware-permission-checker"],
        "icon": "shield", "color": "red", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 9,
        "title": "Message Brokers & Asynchronous Queues",
        "subtitle": "Apache Kafka, RabbitMQ, Redis Pub/Sub & AWS SQS",
        "description": "Decouple backend microservices with asynchronous messaging: Publish-Subscribe models, message queues (RabbitMQ, SQS), and log-based event streaming with Apache Kafka.",
        "guide": """### 📩 1. Message Queue vs Event Stream
- **RabbitMQ (AMQP Queue)**: Smart broker, dumb consumer. Message deleted upon ACK.
- **Apache Kafka (Event Stream Log)**: Dumb broker, smart consumer. Persistent log offset enables message replaying.""",
        "codeSnippet": "// Kafka Consumer in Node.js (kafkajs)\nconst { Kafka } = require('kafkajs');\nconst kafka = new Kafka({ brokers: ['localhost:9092'] });\nconst consumer = kafka.consumer({ groupId: 'order-service' });\n\nawait consumer.connect();\nawait consumer.subscribe({ topic: 'order-events' });\nawait consumer.run({\n  eachMessage: async ({ message }) => {\n    console.log(`Order Processed: ${message.value.toString()}`);\n  }\n});",
        "submodules": [
            {"name": "RabbitMQ (AMQP Protocol)", "status": "pending"},
            {"name": "Apache Kafka Event Streaming", "status": "pending"},
            {"name": "AWS SQS & SNS Queues", "status": "pending"},
            {"name": "Dead Letter Queues (DLQ) & Retry Policies", "status": "pending"}
        ],
        "interviewFaqs": ["Compare Kafka vs RabbitMQ.", "How do you guarantee exactly-once message processing?"],
        "topics": ["Kafka", "RabbitMQ", "Queues", "Event Streaming", "PubSub"],
        "problems": ["kafka-order-event-consumer"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 10,
        "title": "Containerization & Orchestration",
        "subtitle": "Docker, Multi-Stage Builds, Docker Compose & Kubernetes",
        "description": "Package backend services into immutable containers with Docker: Dockerfiles, multi-stage minimal builds, container networking, Docker Compose multi-service orchestration, and Kubernetes cluster fundamentals.",
        "guide": """### 🐳 1. Docker Multi-Stage Builds
Separate build dependencies from production runtime images to minimize security attack surface and reduce container image size (< 50MB).""",
        "codeSnippet": "# Multi-Stage Dockerfile for Go Application\nFROM golang:1.22-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN go build -o server main.go\n\nFROM alpine:latest\nWORKDIR /app\nCOPY --from=builder /app/server .\nEXPOSE 8080\nCMD [\"./server\"]",
        "submodules": [
            {"name": "Docker Basics & Images / Containers", "status": "pending"},
            {"name": "Multi-Stage Dockerfiles", "status": "pending"},
            {"name": "Docker Compose Multi-Container Setup", "status": "pending"},
            {"name": "Kubernetes Architecture (Pods, Services, Deployments)", "status": "pending"}
        ],
        "interviewFaqs": ["Why are multi-stage Docker builds critical for production containers?", "What is the difference between Docker image layer and container writable layer?"],
        "topics": ["Docker", "Containers", "Kubernetes", "DevOps"],
        "problems": ["dockerfile-production-hardening"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 11,
        "title": "Monitoring, Logging & Observability",
        "subtitle": "Prometheus, Grafana, OpenTelemetry, ELK Stack & Tracing",
        "description": "Instrument backend production systems for full observability: Structured JSON logging (Winston/Zap), Prometheus metrics scraping, Grafana dashboards, and OpenTelemetry distributed tracing across microservices.",
        "guide": """### 📊 1. The Three Pillars of Observability
- **Metrics**: Aggregated numerical counters/gauges (Prometheus).
- **Logs**: Timestamped structured event strings (Elasticsearch / Loki).
- **Traces**: Distributed request propagation paths (OpenTelemetry / Jaeger).""",
        "codeSnippet": "// Prometheus Custom Counter in Express\nconst client = require('prom-client');\nconst httpRequestCounter = new client.Counter({\n  name: 'http_requests_total',\n  help: 'Total HTTP requests count',\n  labelNames: ['method', 'status']\n});\n\napp.use((req, res, next) => {\n  res.on('finish', () => {\n    httpRequestCounter.inc({ method: req.method, status: res.statusCode });\n  });\n  next();\n});",
        "submodules": [
            {"name": "Structured JSON Logging", "status": "pending"},
            {"name": "Prometheus Metrics & PromQL", "status": "pending"},
            {"name": "Grafana Dashboard Visualization", "status": "pending"},
            {"name": "OpenTelemetry & Jaeger Distributed Tracing", "status": "pending"}
        ],
        "interviewFaqs": ["Explain the Three Pillars of Observability.", "How does distributed tracing track requests across microservice boundaries via TraceIDs?"],
        "topics": ["Prometheus", "Grafana", "Observability", "OpenTelemetry", "Logging"],
        "problems": ["prometheus-express-metrics-exporter"],
        "icon": "award", "color": "yellow", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 12,
        "title": "System Design Patterns & Scalability",
        "subtitle": "Load Balancers, Rate Limiting, Sharding & Consistent Hashing",
        "description": "Architect high-throughput scalable backend distributed systems: Load balancing algorithms (Round Robin, Least Connections), Consistent Hashing, Database Sharding, and Rate Limiting (Token Bucket).",
        "guide": """### ⚖️ 1. Consistent Hashing
Distributes keys across a hash ring of nodes, minimizing key re-mapping when nodes join or leave distributed caches or database shards.

### 🚰 2. Rate Limiting Algorithms
- **Token Bucket**: Tokens added at fixed rate; request consumes token.
- **Leaky Bucket**: Requests queued and processed at constant rate.
- **Sliding Window Log**: Redis sorted set timestamp tracking.""",
        "codeSnippet": "# Consistent Hashing Node Resolver (Python)\nimport hashlib\n\nclass ConsistentHashRing:\n    def __init__(self, nodes=None, replicas=3):\n        self.replicas = replicas\n        self.ring = {}\n        self.sorted_keys = []\n        if nodes:\n            for node in nodes:\n                self.add_node(node)",
        "submodules": [
            {"name": "Load Balancing (Nginx, HAProxy, ALB)", "status": "pending"},
            {"name": "Consistent Hashing Ring Algorithm", "status": "pending"},
            {"name": "Database Sharding & Read Replicas", "status": "pending"},
            {"name": "Rate Limiting Algorithms (Token Bucket)", "status": "pending"}
        ],
        "interviewFaqs": ["How does Consistent Hashing work and why is it superior to `hash(key) % N`?", "Explain Token Bucket vs Leaky Bucket rate limiting."],
        "topics": ["System Design", "Load Balancing", "Consistent Hashing", "Sharding", "Rate Limiting"],
        "problems": ["consistent-hashing-ring-implementation"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://roadmap.sh/backend"
    }
]

print("Backend steps ready!")

# Merge into detailed_roadmaps_data.json
out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

roadmap_map = {r['id']: r for r in roadmaps_data}

# Update role-frontend
if 'role-frontend' in roadmap_map:
    roadmap_map['role-frontend']['steps'] = frontend_steps
    roadmap_map['role-frontend']['creator'] = 'roadmap.sh & GrindFam'
else:
    roadmap_map['role-frontend'] = {
        "id": "role-frontend",
        "category": "Role Roadmap",
        "title": "Frontend Developer Roadmap",
        "creator": "roadmap.sh & GrindFam",
        "description": "Exhaustive step-by-step masterclass to become a modern Frontend Developer covering Internet, HTML, CSS, JS, VCS, Package Managers, Frameworks, Build Tools, Testing, Security, SSR, GraphQL, Performance, and Cross-Platform Apps.",
        "steps": frontend_steps
    }

# Update role-backend
if 'role-backend' in roadmap_map:
    roadmap_map['role-backend']['steps'] = backend_steps
    roadmap_map['role-backend']['creator'] = 'roadmap.sh & GrindFam'
else:
    roadmap_map['role-backend'] = {
        "id": "role-backend",
        "category": "Role Roadmap",
        "title": "Backend Developer Roadmap",
        "creator": "roadmap.sh & GrindFam",
        "description": "Complete step-by-step path to master modern backend engineering: Networking, OS, Databases, APIs, Caching, Auth, Queues, Containers, Observability, and System Design.",
        "steps": backend_steps
    }

# Save updated detailed_roadmaps_data.json
updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print(f"Successfully updated detailed_roadmaps_data.json with {len(frontend_steps)} frontend steps and {len(backend_steps)} backend steps!")
