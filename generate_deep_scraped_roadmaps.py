import json
import os
import re

def clean_label(lbl):
    return re.sub(r'^(find the detailed|related roadmaps|roadmap\.sh).*$', '', lbl, flags=re.IGNORECASE).strip()

def process_official_roadmap(slug, json_filepath, category, fallback_title, fallback_creator):
    if not os.path.exists(json_filepath):
        return None

    with open(json_filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', [])

    # Filter text / label nodes
    node_items = []
    seen_labels = set()

    for n in nodes:
        node_data = n.get('data', {})
        label = node_data.get('label', '').strip()

        # Clean noise labels
        cleaned = clean_label(label)
        if not cleaned or len(cleaned) < 2:
            continue
        if cleaned.lower() in ['start', 'end', 'note', 'legend', 'postgresql']:
            continue
        if cleaned in seen_labels:
            continue
        seen_labels.add(cleaned)

        pos = n.get('position', {})
        y_pos = pos.get('y', 0)

        node_items.append({
            'label': cleaned,
            'y': y_pos
        })

    # Sort nodes by Y position (sequence on canvas)
    node_items.sort(key=lambda item: item['y'])

    # Dedicated high quality manual milestone grouping if available for postgresql-dba
    if slug == 'postgresql-dba':
        milestones = [
            {
                'title': 'Relational Database Fundamentals & Concepts',
                'subtitle': 'RDBMS Core, ACID, MVCC & Relational Model',
                'icon': 'database',
                'color': 'blue',
                'topics': [
                    'What are Relational Databases?', 'RDBMS Benefits and Limitations',
                    'PostgreSQL vs NoSQL Databases', 'PostgreSQL vs Other RDBMS',
                    'Basic RDBMS Concepts (Databases, Schemas, Tables, Columns, Rows)',
                    'ACID Compliance', 'MVCC (Multi-Version Concurrency Control)',
                    'Transactions & Isolation Levels', 'Relational Model & Keys'
                ]
            },
            {
                'title': 'PostgreSQL Architecture & Storage Internals',
                'subtitle': 'Process Model, Shared Buffers, WAL & Heap Files',
                'icon': 'tool',
                'color': 'indigo',
                'topics': [
                    'PostgreSQL Process Architecture (Postmaster, Writer, Checkpointer)',
                    'Shared Buffers Memory Architecture', 'Write-Ahead Logging (WAL) & WAL Writer',
                    'Heap Storage Pages & Tuples', 'Autovacuum & Background Workers',
                    'Tablespaces & Database Directory Layout'
                ]
            },
            {
                'title': 'SQL Execution & Advanced Queries',
                'subtitle': 'DDL, DML, Window Functions, CTEs & JSONB',
                'icon': 'code',
                'color': 'purple',
                'topics': [
                    'Data Definition Language (DDL) & Integrity Constraints',
                    'Data Manipulation Language (DML) & Complex Joins',
                    'Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
                    'Common Table Expressions (CTEs) & Recursive Queries',
                    'JSONB & Semi-Structured Data Operations'
                ]
            },
            {
                'title': 'Query Optimization & Performance Tuning',
                'subtitle': 'EXPLAIN ANALYZE, Indexing & Work Memory',
                'icon': 'zap',
                'color': 'yellow',
                'topics': [
                    'EXPLAIN & EXPLAIN ANALYZE Execution Plans',
                    'B-Tree Indexes & Primary Keys', 'GIN & GiST Indexes for Search/JSONB',
                    'Partial Indexes & Expression Indexes', 'BRIN Indexes for Time Series',
                    'Memory Configuration (work_mem, maintenance_work_mem)'
                ]
            },
            {
                'title': 'Maintenance & Autovacuum Management',
                'subtitle': 'Vacuuming, Bloat Cleanup & Statistics',
                'icon': 'tool',
                'color': 'teal',
                'topics': [
                    'VACUUM & VACUUM FULL Operations', 'Autovacuum Configuration & Tuning',
                    'Transaction ID (XID) Wraparound Prevention', 'Database & Index Bloat Management',
                    'ANALYZE & Query Planner Statistics (pg_statistic)'
                ]
            },
            {
                'title': 'High Availability, Replication & Connection Pooling',
                'subtitle': 'Streaming Replication, PgBouncer & Failover',
                'icon': 'cloud',
                'color': 'green',
                'topics': [
                    'Physical Streaming Replication (Primary / Standby)',
                    'Logical Replication & Pub/Sub Model',
                    'PgBouncer Connection Pooling (Session vs Transaction Mode)',
                    'High Availability & Automated Failover (Patroni / Stolon)'
                ]
            },
            {
                'title': 'Backup, Point-In-Time Recovery & Security',
                'subtitle': 'pg_basebackup, PITR, pg_hba.conf & RBAC',
                'icon': 'shield',
                'color': 'red',
                'topics': [
                    'Physical Backups (pg_basebackup, WAL-G, pgBackRest)',
                    'Point-In-Time Recovery (PITR) Execution Drill',
                    'Client Authentication (pg_hba.conf & SSL/TLS)',
                    'Role-Based Access Control (RBAC) & Column Encryption',
                    'pgaudit Audit Logging'
                ]
            },
            {
                'title': 'Database Monitoring, Alerting & Operations',
                'subtitle': 'pg_stat_statements, Prometheus & Grafana',
                'icon': 'award',
                'color': 'yellow',
                'topics': [
                    'Query Performance Tracking (pg_stat_statements)',
                    'Locks, Deadlocks & Lock Monitoring (pg_locks)',
                    'Prometheus PostgreSQL Exporter Integration',
                    'Grafana Dashboards for DB Metrics & Alerting'
                ]
            }
        ]
    else:
        # Fallback automatic grouping into 6 steps
        milestones = []
        chunk_size = max(2, len(node_items) // 6)
        step_idx = 1
        for i in range(0, len(node_items), chunk_size):
            chunk = node_items[i:i + chunk_size]
            if not chunk:
                continue
            t_list = [item['label'] for item in chunk]
            milestones.append({
                'title': t_list[0],
                'subtitle': f"Master {t_list[0]} & Core Concepts",
                'icon': 'code',
                'color': 'blue' if step_idx % 2 == 1 else 'indigo',
                'topics': t_list
            })
            step_idx += 1

    # Format steps
    formatted_steps = []
    for idx, m in enumerate(milestones, start=1):
        formatted_steps.append({
            'stepNumber': idx,
            'title': m['title'],
            'subtitle': m['subtitle'],
            'description': f"Comprehensive module covering {m['title']}. Study key concepts: {', '.join(m['topics'][:4])}.",
            'topics': m['topics'],
            'submodules': [{'name': t, 'status': 'pending'} for t in m['topics']],
            'problems': [
                f"{slug}-{idx}-foundations",
                f"{slug}-{idx}-advanced"
            ],
            'icon': m['icon'],
            'color': m['color'],
            'sourceUrl': f"https://roadmap.sh/{slug}"
        })

    return {
        'id': f"official-{slug}",
        'category': category,
        'title': data.get('title', {}).get('page', fallback_title),
        'creator': fallback_creator,
        'description': data.get('description', f"Official {fallback_title} guide"),
        'steps': formatted_steps
    }

officials = [
    ('postgresql-dba', 'deep_postgresql-dba_api.json', 'Role Roadmap', 'PostgreSQL DBA Roadmap', 'roadmap.sh (Official)'),
    ('frontend', 'deep_frontend_api.json', 'Role Roadmap', 'Frontend Developer Roadmap', 'roadmap.sh (Official)'),
    ('backend', 'deep_backend_api.json', 'Role Roadmap', 'Backend Developer Roadmap', 'roadmap.sh (Official)'),
    ('devops', 'deep_devops_api.json', 'Role Roadmap', 'DevOps & Cloud Engineer Roadmap', 'roadmap.sh (Official)')
]

roadmap_list = []

for slug, filepath, category, title, creator in officials:
    rm = process_official_roadmap(slug, filepath, category, title, creator)
    if rm and rm['steps']:
        roadmap_list.append(rm)

# Save to detailed_roadmaps_data.json
out_file = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")
os.makedirs(os.path.dirname(out_file), exist_ok=True)

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(roadmap_list, f, indent=2)

print(f"Successfully generated detailed JSON roadmap tree for {len(roadmap_list)} roadmaps in {out_file}!")
