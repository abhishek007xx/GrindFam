import json
import os

out_path = os.path.join("frontend", "src", "data", "detailed_roadmaps_data.json")

with open(out_path, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

# Domain topics generator for auto-expanding any remaining single-digit step roadmaps
domain_knowledge = {
    'role-fullstack': [
        ('Frontend Core & HTML/CSS/JS', 'HTML5 Semantics, CSS Grid/Flexbox, JavaScript ES6+ & DOM APIs', 'code', 'yellow', ['HTML', 'CSS', 'JavaScript', 'DOM']),
        ('Modern Frontend Frameworks', 'React.js, Vue.js, State Management, Hooks & Component Architecture', 'code', 'purple', ['React', 'Vue', 'JSX', 'Hooks']),
        ('Backend Programming & Runtimes', 'Node.js / Express, Python FastAPI, Go, REST APIs & Routing', 'terminal', 'blue', ['Node.js', 'Express', 'Python', 'REST']),
        ('Databases & Data Modeling', 'PostgreSQL, SQL Queries, Joins, MongoDB Document Storage & Indexing', 'database', 'red', ['PostgreSQL', 'MongoDB', 'SQL', 'Indexes']),
        ('Authentication & Security', 'JWT Tokens, OAuth 2.0, HttpOnly Cookies, CORS, XSS & CSRF Prevention', 'shield', 'red', ['JWT', 'OAuth', 'CORS', 'Security']),
        ('State Management & Data Fetching', 'Redux Toolkit, Zustand, TanStack Query (React Query) & Axios', 'zap', 'yellow', ['Redux', 'TanStack Query', 'Zustand']),
        ('Full Stack Frameworks & SSR', 'Next.js App Router, Server Components, Nuxt.js & Server Actions', 'cloud', 'indigo', ['Next.js', 'SSR', 'Server Components']),
        ('Testing & Quality Assurance', 'Vitest, Jest unit testing, React Testing Library & Playwright E2E', 'award', 'green', ['Vitest', 'RTL', 'Playwright', 'Testing']),
        ('Containerization & Deployment', 'Docker containers, Vercel, Render, AWS EC2/S3 & CI/CD Pipelines', 'cloud', 'blue', ['Docker', 'Vercel', 'AWS', 'CI/CD'])
    ],
    'role-cyber-security': [
        ('Network Security Fundamentals', 'OSI Model 7 Layers, TCP/IP Handshake, Wireshark Packet Inspection & Firewalls', 'shield', 'red', ['Networking', 'OSI Model', 'Wireshark', 'TCP']),
        ('Ethical Hacking & Penetration Testing', 'Nmap Scanning, Metasploit Framework, Burp Suite & Privilege Escalation', 'terminal', 'red', ['Nmap', 'Metasploit', 'Burp Suite', 'Pentesting']),
        ('Web Application Security (OWASP Top 10)', 'SQL Injection, XSS, CSRF, SSRF, Broken Auth & Remote Code Execution', 'shield', 'red', ['OWASP', 'XSS', 'SQLi', 'CSRF']),
        ('Cryptography & PKI Infrastructure', 'Symmetric AES, Asymmetric RSA/ECC, Hashing Algorithms & SSL/TLS Handshake', 'shield', 'yellow', ['Cryptography', 'AES', 'RSA', 'TLS']),
        ('Security Information & Event Management (SIEM)', 'Splunk, Elastic SIEM, Log Analysis, Intrusion Detection (Snort/Zeek)', 'award', 'purple', ['SIEM', 'Splunk', 'Logs', 'IDS']),
        ('Cloud & DevSecOps Security', 'AWS IAM Policies, HashiCorp Vault Secrets, Trivy Container Vulnerability Scanning', 'cloud', 'indigo', ['DevSecOps', 'IAM', 'Vault', 'Trivy'])
    ],
    'role-qa': [
        ('Software Testing Fundamentals', 'Manual Testing, Test Plans, Test Cases, Black Box vs White Box Testing', 'award', 'green', ['Test Cases', 'Manual Testing', 'QA']),
        ('API Testing with Postman & REST Assured', 'Postman Collections, Environment Variables, Automated Assertions & Newman CLI', 'code', 'blue', ['Postman', 'API Testing', 'REST Assured']),
        ('UI Test Automation with Playwright & Cypress', 'Playwright Selector Engine, Locators, Async Assertions & Page Object Model (POM)', 'code', 'purple', ['Playwright', 'Cypress', 'POM', 'Automation']),
        ('Mobile & Cross-Browser Testing', 'Appium Mobile Testing, Saucelabs Browser Matrix & Parallel Execution', 'cloud', 'yellow', ['Appium', 'Cross-Browser', 'Mobile Testing']),
        ('CI/CD Pipeline Integration', 'GitHub Actions Test Automation, Allure Reports & Slack Test Notifications', 'zap', 'indigo', ['CI/CD', 'GitHub Actions', 'Reports'])
    ]
}

expanded_count = 0
for rm in roadmaps_data:
    r_id = rm['id']
    steps = rm.get('steps', [])
    if len(steps) <= 4:
        if r_id in domain_knowledge:
            specs = domain_knowledge[r_id]
            new_steps = []
            for idx, (title, sub, icon, color, topics) in enumerate(specs, start=1):
                new_steps.append({
                    "stepNumber": idx,
                    "title": title,
                    "subtitle": sub,
                    "description": f"Master {title}. Key areas: {', '.join(topics)}.",
                    "guide": f"### 📌 {title}\nDeep dive into {sub}. Understand key patterns and industry best practices.",
                    "codeSnippet": f"// Code example for {title}\nconsole.log('Executing {title} module');",
                    "submodules": [{"name": t, "status": "pending"} for t in topics],
                    "interviewFaqs": [f"What are the core concepts of {title}?", f"How do you apply {topics[0]} in production?"],
                    "topics": topics,
                    "problems": [f"{r_id}-{idx}-practice-problem"],
                    "icon": icon,
                    "color": color,
                    "sourceUrl": f"https://roadmap.sh/{r_id.replace('role-', '').replace('tech-', '')}"
                })
            rm['steps'] = new_steps
            expanded_count += 1

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(roadmaps_data, f, indent=2)

print(f"Expanded step counts for {expanded_count} domain roadmaps!")
