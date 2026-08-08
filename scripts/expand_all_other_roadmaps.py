import json
import os

out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

# Comprehensive milestone definitions for all remaining key role and technology roadmaps
additional_roadmaps = {
    'role-postgresql-dba': [
        ("Relational Database & PostgreSQL Core", "RDBMS Theory, ACID Guarantees, MVCC Mechanics & Tuple Versioning", "database", "red", ["RDBMS", "ACID", "MVCC", "xmin/xmax"]),
        ("PostgreSQL Architecture & Storage Memory", "Postmaster Process, Shared Buffers, WAL Writer, Checkpointer & 8KB Heap Pages", "cloud", "indigo", ["Postmaster", "Shared Buffers", "WAL", "Checkpointer"]),
        ("SQL Execution Plans & Query Tuning", "EXPLAIN ANALYZE, B-Tree, GIN, GiST, BRIN Indexes & work_mem Tuning", "zap", "yellow", ["EXPLAIN", "B-Tree", "GIN", "work_mem"]),
        ("Maintenance & Autovacuum Management", "VACUUM FULL, Autovacuum Tuning, XID Wraparound Prevention & Bloat Cleanup", "tool", "teal", ["VACUUM", "Autovacuum", "XID", "Bloat"]),
        ("High Availability & Replication", "Streaming Replication, Logical Pub/Sub, PgBouncer & Automated Failover (Patroni)", "cloud", "green", ["Streaming Replication", "PgBouncer", "Patroni"]),
        ("Backup, Point-In-Time Recovery & Security", "pg_basebackup, PITR Drills, pg_hba.conf, SSL & Role-Based Access Control", "shield", "red", ["PITR", "pg_basebackup", "pg_hba.conf", "RBAC"]),
        ("Database Monitoring & Alerting", "pg_stat_statements, Prometheus PostgreSQL Exporter & Grafana Dashboards", "award", "yellow", ["pg_stat_statements", "Prometheus", "Grafana"])
    ],
    'role-ai-data-scientist': [
        ("Python Data Science Stack", "NumPy Vectorized Math, Pandas DataFrames, Matplotlib & Seaborn", "code", "yellow", ["NumPy", "Pandas", "Matplotlib", "Seaborn"]),
        ("Probability & Applied Statistics", "Descriptive Statistics, Probability Distributions, Hypothesis Testing (t-test, p-value)", "zap", "blue", ["Statistics", "p-value", "t-test", "Normal Distribution"]),
        ("Supervised Machine Learning", "Linear/Logistic Regression, Decision Trees, Random Forests & XGBoost", "cpu", "purple", ["Regression", "Random Forest", "XGBoost"]),
        ("Unsupervised Learning & Clustering", "K-Means Clustering, Hierarchical Clustering, PCA Dimensionality Reduction", "layers", "teal", ["K-Means", "PCA", "Clustering"]),
        ("Deep Learning & PyTorch/TensorFlow", "Neural Networks, Backpropagation, CNNs for Vision & RNNs/LSTMs", "cpu", "purple", ["PyTorch", "Neural Networks", "CNN", "Backprop"]),
        ("NLP & Transformer Models", "Text Preprocessing, Word2Vec, BERT, Transformer Self-Attention & Fine-Tuning", "zap", "indigo", ["NLP", "Transformers", "BERT", "Attention"]),
        ("Model Deployment & MLOps", "FastAPI Model Serving, Docker Containerization, MLflow Tracking & Model Monitoring", "cloud", "green", ["MLflow", "FastAPI", "MLOps", "Model Serving"])
    ],
    'role-data-engineer': [
        ("Data Warehousing & SQL Modeling", "Snowflake, Google BigQuery, Star Schema, Snowflake Schema & dbt", "database", "blue", ["Snowflake", "BigQuery", "dbt", "Star Schema"]),
        ("Distributed Data Processing (Spark & PySpark)", "Apache Spark RDDs, DataFrames, Distributed Joins & Memory Tuning", "zap", "yellow", ["Spark", "PySpark", "RDD", "DataFrames"]),
        ("Data Pipeline Orchestration (Airflow)", "Apache Airflow DAGs, Operators, Sensors, Task Execution & Backfilling", "cloud", "indigo", ["Airflow", "DAG", "Orchestration", "Backfilling"]),
        ("Real-Time Streaming Pipelines", "Kafka Streams, Apache Flink, Structured Streaming & Delta Lake", "zap", "purple", ["Kafka", "Flink", "Delta Lake", "Streaming"]),
        ("Data Governance & Quality", "Great Expectations data validation, Data Lineage & Iceberg Tables", "shield", "teal", ["Data Quality", "Apache Iceberg", "Lineage"])
    ],
    'role-android': [
        ("Kotlin Core & Android SDK", "Kotlin Syntax, Null Safety, Coroutines, Flow & Android Lifecycle", "code", "green", ["Kotlin", "Coroutines", "Flow", "Android Lifecycle"]),
        ("Modern Android UI with Jetpack Compose", "Declarative UI Composables, State Management, Modifiers & Material Design 3", "code", "purple", ["Jetpack Compose", "Composables", "Material Design"]),
        ("Android Architecture & Dependency Injection", "MVVM Pattern, ViewModel, Repository Pattern, Room DB & Hilt/Dagger", "layers", "blue", ["MVVM", "ViewModel", "Room", "Hilt"]),
        ("Networking & Asynchronous Coroutines", "Retrofit 2 REST Client, OkHttp Interceptors, Moshi JSON & Coroutine Scopes", "zap", "yellow", ["Retrofit", "OkHttp", "Coroutines"]),
        ("App Publishing & Testing", "JUnit 5 Unit Tests, Espresso UI Testing, Play Store Distribution & App Bundles", "award", "indigo", ["JUnit", "Espresso", "Play Store", "AAB"])
    ],
    'role-ios': [
        ("Swift Syntax & Memory Management", "Swift 5.10 Syntax, Structs vs Classes, ARC (Automatic Reference Counting) & Protocols", "code", "orange", ["Swift", "ARC", "Protocols", "Structs"]),
        ("Modern iOS UI with SwiftUI", "Declarative Views, @State, @Binding, @StateObject, Layouts & Animation", "code", "purple", ["SwiftUI", "@State", "Views", "Animations"]),
        ("iOS Architecture & Combine/AsyncAwait", "MVVM Architecture, Swift Concurrency (async/await, TaskGroup) & Combine", "layers", "blue", ["MVVM", "Async/Await", "Combine", "TaskGroup"]),
        ("Data Persistence & Networking", "CoreData, SwiftData, URLSession, Codable Protocol & JSON Parsing", "database", "red", ["SwiftData", "CoreData", "URLSession", "Codable"]),
        ("Testing & App Store Distribution", "XCTest Framework, UI Testing, TestFlight & App Store Submission", "award", "green", ["XCTest", "TestFlight", "App Store"])
    ],
    'role-intern': [
        ("Language Syntax & Algorithmic Warmups", "C++ / Java / Python Core, Input/Output, Control Flow & Math Patterns", "code", "blue", ["Syntax", "Control Flow", "Loops", "Patterns"]),
        ("Asymptotic Complexity & Data Structures", "Big-O Analysis, Arrays, Strings, Searching & Sorting Algorithms", "zap", "yellow", ["Big-O", "Arrays", "Binary Search", "Sorting"]),
        ("Core Computer Science Fundamentals", "OS (Processes/Threads), DBMS (SQL/Joins/ACID) & Computer Networks (HTTP/TCP)", "terminal", "purple", ["OS", "DBMS", "Networks", "SQL"]),
        ("Web Development & Project Building", "HTML/CSS/JS or Backend APIs, Git Version Control & GitHub Repositories", "globe", "teal", ["Web Dev", "Git", "GitHub", "APIs"]),
        ("Resume & OA Interview Prep", "Online Assessment (OA) Patterns, Resume Projects & Mock Behavioral Interviews", "award", "green", ["OA Prep", "Resume", "LeetCode", "Behavioral"])
    ],
    'role-senior-sde': [
        ("Hard Algorithmic Patterns & Advanced Structures", "DSU, Segment Trees, Monotonic Queues, Hard DP & Tree DP Patterns", "zap", "red", ["DSU", "Segment Tree", "Monotonic Queue", "Hard DP"]),
        ("Low-Level Design (LLD) & Object-Oriented", "SOLID Principles, Design Patterns (Factory, Strategy, Observer) & UML Diagrams", "tool", "purple", ["SOLID", "LLD", "Design Patterns", "UML"]),
        ("High-Level Design (HLD) & Distributed Architecture", "Load Balancing, Caching, DB Sharding, Kafka Streaming & System Scalability", "database", "green", ["HLD", "Distributed Systems", "Kafka", "Sharding"]),
        ("Technical Leadership & Mentorship", "System RFC Proposals, Code Review Standards, Architecture Tradeoffs & Mentorship", "award", "yellow", ["RFC", "Leadership", "Mentorship", "Code Review"])
    ]
}

roadmap_map = {r['id']: r for r in roadmaps_data}

for r_id, specs in additional_roadmaps.items():
    if r_id in roadmap_map:
        new_steps = []
        for idx, (title, sub, icon, color, topics) in enumerate(specs, start=1):
            new_steps.append({
                "stepNumber": idx,
                "title": title,
                "subtitle": sub,
                "description": f"Comprehensive step covering {title}. Focus on {', '.join(topics)}.",
                "guide": f"### 📌 {title}\nMaster key skills: {sub}.",
                "codeSnippet": f"// Code example for {title}\nconsole.log('Mastering {title}');",
                "submodules": [{"name": t, "status": "pending"} for t in topics],
                "interviewFaqs": [f"Explain the core mechanics of {title}.", f"What are common production issues in {topics[0]}?"],
                "topics": topics,
                "problems": [f"{r_id}-{idx}-exercise"],
                "icon": icon,
                "color": color,
                "sourceUrl": f"https://roadmap.sh/{r_id.replace('role-', '')}"
            })
        roadmap_map[r_id]['steps'] = new_steps

updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print(f"Successfully updated step trees for {len(additional_roadmaps)} additional roadmaps!")
