import json
import os

devops_steps = [
    {
        "stepNumber": 1,
        "title": "Linux Fundamentals & Command Line Mastery",
        "subtitle": "Shell CLI, File Hierarchy, Permissions, Systemd & Cron",
        "description": "Master Linux operating system internals: Bash scripting, Linux filesystem hierarchy (/var, /etc, /proc), file permissions (chmod/chown), Systemd service management, and cron automation.",
        "guide": """### 🐧 1. Linux Filesystem Hierarchy
- `/etc`: System configuration files.
- `/var`: Variable data (logs in `/var/log`, databases).
- `/proc`: Virtual filesystem providing kernel & process information.

### 🔐 2. File Permissions (Octal Notation)
- `chmod 755 script.sh`: Read/Write/Execute for Owner; Read/Execute for Group/Others.
- `chown -R www-data:www-data /var/www/html`: Change ownership recursively.""",
        "codeSnippet": """# Systemd Service Configuration (/etc/systemd/system/app.service)
[Unit]
Description=GrindFam Backend API Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target""",
        "submodules": [
            {"name": "Linux Filesystem Hierarchy ($HOME, /etc, /var)", "status": "pending"},
            {"name": "Bash & Shell Automation Scripting", "status": "pending"},
            {"name": "File Permissions & Ownership (chmod, chown)", "status": "pending"},
            {"name": "Systemd Services & Process Management", "status": "pending"},
            {"name": "Cron Job Automation & Schedulers", "status": "pending"}
        ],
        "interviewFaqs": ["What is Systemd and how does `systemctl` manage Linux services?", "Explain Linux file permissions `chmod 755` vs `chmod 644`."],
        "topics": ["Linux", "Bash", "Shell", "Permissions", "Systemd"],
        "problems": ["linux-bash-log-parser-script"],
        "icon": "terminal", "color": "blue", "sourceUrl": "https://roadmap.sh/devops"
    },
    {
        "stepNumber": 2,
        "title": "Networking, Firewalls & Protocols",
        "subtitle": "IP Addressing, CIDR, DNS, SSH Key Auth, Firewalls & Load Balancers",
        "description": "Understand cloud networking essentials: IPv4/IPv6, CIDR subnetting (`/24`, `/16`), DNS record types (A, CNAME, MX, TXT), SSH key authentication, UFW/iptables firewalls, and Reverse Proxies.",
        "guide": """### 🌐 1. CIDR Subnetting
- `10.0.0.0/16`: 65,536 total IP addresses (`10.0.0.0` - `10.0.255.255`).
- `192.168.1.0/24`: 256 IP addresses (`192.168.1.0` - `192.168.1.255`).

### 🔑 2. SSH Public/Private Key Auth
Generate ED25519 keypairs: `ssh-keygen -t ed25519 -C "admin@grindfam.dev"`. Copy public key to server `~/.ssh/authorized_keys`.""",
        "codeSnippet": """# Nginx Reverse Proxy Config (/etc/nginx/sites-available/api)
server {
    listen 80;
    server_name api.grindfam.dev;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}""",
        "submodules": [
            {"name": "IP Addressing & CIDR Subnetting", "status": "pending"},
            {"name": "DNS Record Types (A, CNAME, TXT, MX)", "status": "pending"},
            {"name": "SSH Key Security & Tunneling", "status": "pending"},
            {"name": "UFW / iptables Firewall Configuration", "status": "pending"},
            {"name": "Nginx & HAProxy Reverse Proxies", "status": "pending"}
        ],
        "interviewFaqs": ["Explain CIDR notation and how `/24` subnet masking works.", "How does Nginx act as a reverse proxy and load balancer?"],
        "topics": ["Networking", "CIDR", "DNS", "SSH", "Nginx"],
        "problems": ["nginx-reverse-proxy-load-balancer"],
        "icon": "globe", "color": "blue", "sourceUrl": "https://roadmap.sh/devops"
    },
    {
        "stepNumber": 3,
        "title": "Containerization: Docker Masterclass",
        "subtitle": "Docker CLI, Dockerfiles, Storage Volumes & Docker Compose",
        "description": "Package production applications into isolated containers: Docker daemon architecture, Dockerfile instructions (`ENTRYPOINT` vs `CMD`), bind mounts, persistent volumes, and multi-container Docker Compose.",
        "guide": """### 🐳 1. ENTRYPOINT vs CMD
- `ENTRYPOINT`: Defines executable command that always runs (e.g. `ENTRYPOINT ["python", "app.py"]`).
- `CMD`: Provides default arguments passed to `ENTRYPOINT` that can be overridden at runtime.""",
        "codeSnippet": "# docker-compose.yml for Node.js API + PostgreSQL + Redis\nversion: '3.8'\nservices:\n  api:\n    build: .\n    ports:\n      - \"4000:4000\"\n    environment:\n      - DATABASE_URL=postgres://user:pass@db:5432/main\n    depends_on:\n      - db\n      - redis\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: pass\n  redis:\n    image: redis:7-alpine",
        "submodules": [
            {"name": "Docker Engine Architecture", "status": "pending"},
            {"name": "Dockerfile Best Practices", "status": "pending"},
            {"name": "Docker Volumes & Bind Mounts", "status": "pending"},
            {"name": "Docker Networking (Bridge, Host, Overlay)", "status": "pending"},
            {"name": "Docker Compose Multi-Container Specs", "status": "pending"}
        ],
        "interviewFaqs": ["What is the difference between `COPY` and `ADD` in Dockerfile?", "Compare Docker Volume vs Bind Mount."],
        "topics": ["Docker", "Containers", "Docker Compose", "DevOps"],
        "problems": ["docker-compose-three-tier-stack"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/devops"
    },
    {
        "stepNumber": 4,
        "title": "Container Orchestration: Kubernetes (K8s)",
        "subtitle": "Pods, Deployments, Services, Ingress & Helm Charts",
        "description": "Orchestrate containerized production workloads at scale: Kubernetes architecture (Control Plane, Worker Nodes, Kubelet), Pods, ReplicaSets, Deployments, NodePort/ClusterIP/LoadBalancer Services, Ingress Controllers, and Helm charts.",
        "guide": """### ☸️ 1. Kubernetes Architecture
- **Control Plane**: API Server, etcd, Scheduler, Controller Manager.
- **Worker Nodes**: Kubelet, Kube-Proxy, Container Runtime (containerd).

### 📦 2. Key K8s Objects
- **Pod**: Smallest deployable unit containing 1+ co-located containers.
- **Deployment**: Declarative updates for Pods and ReplicaSets with zero-downtime rolling updates.
- **Service**: Stable virtual IP address abstraction exposing Pods.""",
        "codeSnippet": """# Kubernetes Deployment Spec (deployment.yaml)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
      - name: api
        image: grindfam/backend:v1.2
        ports:
        - containerPort: 4000""",
        "submodules": [
            {"name": "Kubernetes Architecture & Control Plane", "status": "pending"},
            {"name": "Pods, Deployments & Rolling Updates", "status": "pending"},
            {"name": "Services (ClusterIP, NodePort, LoadBalancer)", "status": "pending"},
            {"name": "Ingress Controllers & Cert-Manager", "status": "pending"},
            {"name": "Helm Package Manager Charts", "status": "pending"}
        ],
        "interviewFaqs": ["How does Kubernetes execute zero-downtime Rolling Updates?", "What is the role of `etcd` in a Kubernetes cluster?"],
        "topics": ["Kubernetes", "K8s", "Pods", "Deployments", "Helm"],
        "problems": ["k8s-deployment-service-yaml-spec"],
        "icon": "cloud", "color": "indigo", "sourceUrl": "https://roadmap.sh/devops"
    },
    {
        "stepNumber": 5,
        "title": "Infrastructure as Code (IaC): Terraform",
        "subtitle": "Terraform HCL, Providers, State Files & Modules",
        "description": "Automate cloud infrastructure provisioning using HashiCorp Terraform: HCL syntax, Terraform Providers (AWS/GCP/Azure), State file management (`terraform.tfstate`), remote backends (S3/DynamoDB locks), and reusable modules.",
        "guide": """### 🏗️ 1. Terraform Execution Lifecycle
1. `terraform init`: Downloads cloud providers and plugins.
2. `terraform plan`: Generates execution plan showing resource diffs (+ add, ~ change, - destroy).
3. `terraform apply`: Executes state changes against cloud APIs.

### 🔒 2. Remote State & Locking
Store state in AWS S3 bucket with versioning and enable DynamoDB table state locking to prevent concurrent apply race conditions.""",
        "codeSnippet": """# Terraform AWS EC2 Instance Definition (main.tf)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  tags = {
    Name = "GrindFam-Production-Server"
  }
}""",
        "submodules": [
            {"name": "Terraform HCL Syntax & Workflow", "status": "pending"},
            {"name": "Providers & Cloud Resources (AWS / GCP)", "status": "pending"},
            {"name": "Terraform State Management & Remote S3 Backend", "status": "pending"},
            {"name": "Reusable Infrastructure Modules", "status": "pending"}
        ],
        "interviewFaqs": ["Why is Terraform state locking with DynamoDB critical for team environments?", "Compare Imperative (Ansible) vs Declarative (Terraform) IaC."],
        "topics": ["Terraform", "IaC", "HCL", "AWS", "State Management"],
        "problems": ["terraform-aws-vpc-ec2-provisioning"],
        "icon": "tool", "color": "blue", "sourceUrl": "https://roadmap.sh/devops"
    },
    {
        "stepNumber": 6,
        "title": "CI/CD Pipelines & Continuous Delivery",
        "subtitle": "GitHub Actions, Jenkins, GitLab CI & ArgoCD GitOps",
        "description": "Automate software delivery pipelines: Continuous Integration (automated linting, testing, image building) and Continuous Deployment (staging/production releases, Canary deployments, ArgoCD GitOps).",
        "guide": """### 🚀 1. Continuous Integration (CI)
Automatically trigger automated test suites and container image builds on every Git push or Pull Request.

### 🔄 2. GitOps with ArgoCD
GitOps uses Git repositories as single source of truth for infrastructure. ArgoCD continuously syncs Kubernetes cluster state with Git declarative manifests.""",
        "codeSnippet": """# .github/workflows/deploy.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run Unit Tests
      run: npm test
    - name: Build & Push Docker Image
      run: |
        docker build -t grindfam/api:${{ github.sha }} .
        docker push grindfam/api:${{ github.sha }}""",
        "submodules": [
            {"name": "GitHub Actions Workflow YAML", "status": "pending"},
            {"name": "Jenkins & Pipeline Scripts", "status": "pending"},
            {"name": "GitLab CI/CD Pipelines", "status": "pending"},
            {"name": "GitOps with ArgoCD & Flux", "status": "pending"}
        ],
        "interviewFaqs": ["What is GitOps and how does ArgoCD enforce cluster state synchronization?", "Explain Blue-Green Deployment vs Canary Deployment."],
        "topics": ["CI/CD", "GitHub Actions", "ArgoCD", "GitOps", "Jenkins"],
        "problems": ["github-actions-docker-build-push"],
        "icon": "zap", "color": "yellow", "sourceUrl": "https://roadmap.sh/devops"
    }
]

# Write into detailed_roadmaps_data.json
out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

roadmap_map = {r['id']: r for r in roadmaps_data}

if 'role-devops' in roadmap_map:
    roadmap_map['role-devops']['steps'] = devops_steps
    roadmap_map['role-devops']['creator'] = 'roadmap.sh & GrindFam'

updated_list = list(roadmap_map.values())
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(updated_list, f, indent=2)

print("Successfully added detailed DevOps steps!")
