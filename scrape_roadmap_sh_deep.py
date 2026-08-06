import requests
import json
import re
from bs4 import BeautifulSoup

# Let's test fetching roadmap.sh API or raw JSON
urls = [
    "https://roadmap.sh/postgresql-dba",
    "https://roadmap.sh/frontend",
    "https://roadmap.sh/backend",
    "https://roadmap.sh/devops"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*"
}

for url in urls:
    slug = url.split('/')[-1]
    print(f"Fetching {url}...")

    # Try API endpoints if available
    api_url = f"https://roadmap.sh/api/v1-official-roadmap/{slug}"
    try:
        res = requests.get(api_url, headers=headers, timeout=10)
        if res.status_code == 200:
            print(f"API Success for {slug}!")
            data = res.json()
            with open(f"deep_{slug}_api.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            continue
    except Exception as e:
        print(f"API attempt failed: {e}")

    # Fallback HTML scraping
    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            html = res.text
            # Look for embedded JSON script tags
            soup = BeautifulSoup(html, 'html.parser')
            json_scripts = soup.find_all('script', type='application/json')
            print(f"Found {len(json_scripts)} JSON scripts in HTML for {slug}")
            for idx, script in enumerate(json_scripts):
                try:
                    js_data = json.loads(script.string)
                    with open(f"deep_{slug}_script_{idx}.json", "w", encoding="utf-8") as f:
                        json.dump(js_data, f, indent=2)
                except Exception:
                    pass
    except Exception as e:
        print(f"HTML scraping failed: {e}")
