import json
import os
import re

# Load frontend steps from build_frontend_roadmap.py
from build_frontend_roadmap import frontend_steps

def clean_label(lbl):
    return re.sub(r'^(find the detailed|related roadmaps|roadmap\.sh|have a look at).*$', '', lbl, flags=re.IGNORECASE).strip()

# ── 1. BACKEND ROADMAP (18 Milestones) ──
backend_steps = [
    {
        "stepNumber": 1,
        "title": "Internet & Networking Protocols",
        "subtitle": "HTTP/HTTPS, TCP/IP, UDP, DNS, TLS Handshake & Sockets",
        "description": "Understand core networking principles powering backend systems: OSI model layers, TCP three-way handshake, UDP datagrams, HTTP headers, and socket communication.",
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
        "title": "Operating System & Systems Programming",
        "subtitle": "Processes, Threads, Concurrency, Memory Management & I/O Calls",
        "description": "Master OS fundamentals: Process management, multithreading, concurrency vs parallelism, blocking vs non-blocking I/O calls, POSIX file systems, and memory management.",
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
            {"name": "POSIX File Systems & Terminal CLI", "status": "pending"}
        ],
        "interviewFaqs": ["What is a deadlock and what are the 4 Coffman conditions required for it?", "Compare OS Process vs Thread."],
        "topics": ["OS", "Threads", "Processes", "Concurrency", "I/O"],
        "problems": ["producer-consumer-mutex-queue"],
        "icon": "terminal", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 3,
        "title": "Pick a Backend Language: Node, Go, Python, Java",
        "subtitle": "Node.js / TypeScript, Python, Go, Java, Rust, C#, PHP, Ruby",
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
            {"name": "Rust (Actix / Axum)", "status": "pending"},
            {"name": "C# (.NET Core)", "status": "pending"}
        ],
        "interviewFaqs": ["How does Go scheduler manage thousands of Goroutines efficiently?", "What is Python GIL?"],
        "topics": ["Node.js", "Python", "Go", "Java", "Backend Languages"],
        "problems": ["concurrent-web-crawler-go"],
        "icon": "code", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 4,
        "title": "Version Control Systems (Git & GitHub)",
        "subtitle": "Git Commands, Branching Models, Interactive Rebase & PR Reviews",
        "description": "Master Git version control: commit history tracking, branching models (GitFlow, Trunk-based), interactive rebase, cherry-pick, and resolving merge conflicts.",
        "guide": """### 🌿 1. Essential Git Commands
`git add .` && `git commit -m "feat: backend auth API"`
`git checkout -b feature/auth`
`git pull --rebase origin main`""",
        "codeSnippet": "# Interactive rebase to squash commits\ngit rebase -i HEAD~3",
        "submodules": [
            {"name": "Git Basics & Installation", "status": "pending"},
            {"name": "Branching & Merging Strategies", "status": "pending"},
            {"name": "Interactive Rebase & Cherry-Pick", "status": "pending"},
            {"name": "GitHub & GitLab Code Reviews", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between git merge and git rebase?"],
        "topics": ["Git", "VCS", "Rebase", "GitHub"],
        "problems": ["git-interactive-rebase-drill"],
        "icon": "tool", "color": "blue", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 5,
        "title": "Relational Databases (PostgreSQL, MySQL)",
        "subtitle": "SQL DDL/DML, Joins, Normalization, ACID & B-Tree Indexes",
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
        "stepNumber": 6,
        "title": "NoSQL Databases & Document Stores",
        "subtitle": "MongoDB, Redis, Cassandra, DynamoDB & Key-Value vs Column",
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
            {"name": "DynamoDB NoSQL Service", "status": "pending"},
            {"name": "CAP Theorem & PACELC Theorem", "status": "pending"}
        ],
        "interviewFaqs": ["Explain CAP Theorem with real-world database examples.", "When would you prefer MongoDB over PostgreSQL?"],
        "topics": ["MongoDB", "Redis", "NoSQL", "CAP Theorem", "Databases"],
        "problems": ["redis-rate-limiter-sliding-window"],
        "icon": "database", "color": "red", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 7,
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
        "stepNumber": 8,
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
        "stepNumber": 9,
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
        "stepNumber": 10,
        "title": "Search Engines & Vector Databases",
        "subtitle": "Elasticsearch, OpenSearch, Pinecone, Qdrant & Inverted Indexing",
        "description": "Master full-text search engines and vector similarity search: Elasticsearch inverted indexes, BM25 relevance scoring, Pinecone, Qdrant, and HNSW vector indexing for AI search.",
        "guide": """### 🔍 1. Inverted Indexing (Elasticsearch)
Maps every unique word to the list of documents containing that word for sub-millisecond keyword lookup.

### 🤖 2. Vector Search (Pinecone/Qdrant)
Converts text into high-dimensional embeddings and calculates Cosine Similarity or Euclidean distance to retrieve semantically similar items.""",
        "codeSnippet": "# Elasticsearch Query DSL\nGET /products/_search\n{\n  \"query\": {\n    \"match\": {\n      \"title\": \"wireless mechanical keyboard\"\n    }\n  }\n}",
        "submodules": [
            {"name": "Elasticsearch & OpenSearch Architecture", "status": "pending"},
            {"name": "Inverted Indexing & BM25 Scoring", "status": "pending"},
            {"name": "Pinecone & Qdrant Vector Databases", "status": "pending"},
            {"name": "Vector Embeddings & HNSW Indexing", "status": "pending"}
        ],
        "interviewFaqs": ["How does Elasticsearch inverted index work?", "What is HNSW vector indexing?"],
        "topics": ["Elasticsearch", "Pinecone", "Vector DB", "Search Engines", "AI Search"],
        "problems": ["elasticsearch-query-aggregation"],
        "icon": "search", "color": "teal", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 11,
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
        "stepNumber": 12,
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
        "stepNumber": 13,
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
        "stepNumber": 14,
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
    },
    {
        "stepNumber": 15,
        "title": "Microservices Architecture & Design",
        "subtitle": "Service Discovery, API Gateways, CQRS & Saga Pattern",
        "description": "Design resilient microservice architectures: Service Discovery (Consul/Eureka), API Gateways (Kong/Tyk), Event Sourcing, Command Query Responsibility Segregation (CQRS), and Saga distributed transactions.",
        "guide": """### 🔄 1. Saga Distributed Transaction Pattern
Coordinates transactions across microservices using a sequence of local transactions. If a step fails, compensation transactions undo previous actions.""",
        "codeSnippet": "// Saga Orchestration Sketch\nasync function executeOrderSaga(order) {\n  try {\n    await paymentService.charge(order);\n    await inventoryService.reserve(order);\n    await shippingService.ship(order);\n  } catch (err) {\n    await paymentService.refund(order);\n  }\n}",
        "submodules": [
            {"name": "Monolith vs Microservices Tradeoffs", "status": "pending"},
            {"name": "API Gateways (Kong, Envoy)", "status": "pending"},
            {"name": "Service Discovery (Consul / Eureka)", "status": "pending"},
            {"name": "CQRS & Event Sourcing", "status": "pending"},
            {"name": "Saga Pattern for Distributed Transactions", "status": "pending"}
        ],
        "interviewFaqs": ["How does Saga Pattern solve distributed transactions in microservices?", "Explain CQRS (Command Query Responsibility Segregation)."],
        "topics": ["Microservices", "CQRS", "Saga Pattern", "API Gateway", "Architecture"],
        "problems": ["saga-orchestrator-implementation"],
        "icon": "cloud", "color": "purple", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 16,
        "title": "Cloud Computing (AWS, GCP, Azure)",
        "subtitle": "EC2, S3, Cloud Run, Serverless Lambda & VPC",
        "description": "Deploy backend applications to cloud infrastructure: AWS EC2 virtual machines, S3 object storage, AWS Lambda / Cloud Run serverless functions, and VPC network isolation.",
        "guide": """### ☁️ 1. AWS Core Infrastructure
- **EC2**: Virtual servers in the cloud.
- **S3**: Scalable object storage for files and media.
- **VPC**: Isolated virtual private network with public/private subnets and NAT Gateways.""",
        "codeSnippet": "# AWS Boto3 SDK S3 Upload\nimport boto3\ns3 = boto3.client('s3')\ns3.upload_file('local.pdf', 'my-bucket', 'user_files/doc.pdf')",
        "submodules": [
            {"name": "AWS Core Services (EC2, S3, RDS)", "status": "pending"},
            {"name": "VPC Subnets & NAT Gateways", "status": "pending"},
            {"name": "Serverless Functions (AWS Lambda / GCP Cloud Run)", "status": "pending"},
            {"name": "Cloud Security Groups & IAM Roles", "status": "pending"}
        ],
        "interviewFaqs": ["What is a VPC and how do public subnets differ from private subnets?", "When is Serverless Lambda cost-effective vs EC2?"],
        "topics": ["AWS", "Cloud", "S3", "VPC", "Serverless"],
        "problems": ["aws-s3-presigned-url-generator"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 17,
        "title": "Backend Security & Vulnerabilities",
        "subtitle": "OWASP Top 10, SQL Injection, Security Headers & Rate Limiting",
        "description": "Harden backend services against OWASP Top 10 vulnerabilities: SQL Injection (SQLi), Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), and Broken Access Control.",
        "guide": """### 🛡️ 1. SQL Injection Prevention
Always use parameterized SQL queries (prepared statements). Never concatenate user input directly into SQL strings.""",
        "codeSnippet": "-- Safe Parameterized SQL Query\nSELECT * FROM users WHERE email = $1 AND status = $2;",
        "submodules": [
            {"name": "SQL Injection & Parameterized Queries", "status": "pending"},
            {"name": "SSRF (Server-Side Request Forgery)", "status": "pending"},
            {"name": "CORS & Security HTTP Headers", "status": "pending"},
            {"name": "Secrets Management (HashiCorp Vault / AWS Secrets)", "status": "pending"}
        ],
        "interviewFaqs": ["How do Parameterized Queries prevent SQL Injection?", "What is SSRF and how do you protect internal backend APIs from it?"],
        "topics": ["Security", "OWASP", "SQL Injection", "SSRF", "Vault"],
        "problems": ["sql-injection-fix-audit"],
        "icon": "shield", "color": "red", "sourceUrl": "https://roadmap.sh/backend"
    },
    {
        "stepNumber": 18,
        "title": "Architectural Patterns & Clean Code",
        "subtitle": "Clean Architecture, Hexagonal Architecture & Design Patterns",
        "description": "Write maintainable, enterprise-grade backend codebases: Clean Architecture (Domain, Use Cases, Adapters), Hexagonal / Ports and Adapters, SOLID principles, and Gang of Four Design Patterns.",
        "guide": """### 🏛️ 1. Clean Architecture (Uncle Bob)
Separate business logic from external frameworks. Core domain models do not depend on database drivers or web frameworks.""",
        "codeSnippet": "// Clean Architecture Ports & Adapters Interface\nexport interface UserRepository {\n  findById(id: string): Promise<User | null>;\n  save(user: User): Promise<void>;\n}",
        "submodules": [
            {"name": "Clean Architecture Principles", "status": "pending"},
            {"name": "Hexagonal / Ports and Adapters Architecture", "status": "pending"},
            {"name": "SOLID Principles with Code Examples", "status": "pending"},
            {"name": "GoF Design Patterns (Factory, Strategy, Observer)", "status": "pending"}
        ],
        "interviewFaqs": ["Explain Dependency Inversion Principle (DIP).", "What is Ports and Adapters (Hexagonal Architecture)?"],
        "topics": ["Clean Architecture", "SOLID", "Design Patterns", "Software Architecture"],
        "problems": ["clean-architecture-user-usecase"],
        "icon": "code", "color": "purple", "sourceUrl": "https://roadmap.sh/backend"
    }
]

print("Backend 18 milestones created!")

# Update detailed_roadmaps_data.json
out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

roadmap_map = {r['id']: r for r in roadmaps_data}

roadmap_map['role-frontend']['steps'] = frontend_steps
roadmap_map['role-backend']['steps'] = backend_steps

updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print("Saved updated roadmaps data to detailed_roadmaps_data.json!")
