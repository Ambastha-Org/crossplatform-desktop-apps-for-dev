import json
import os
import re
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, 'os_tools.json')
README_PATH = os.path.join(BASE_DIR, 'README.md')

def increment_version(current_version, has_new_tools, has_fixes):
    major, minor, patch = map(int, current_version.split('.'))
    if has_new_tools:
        minor += 1
        patch = 0
    elif has_fixes:
        patch += 1
    return f"{major}.{minor}.{patch}"

def reformat_registry():
    try:
        if not os.path.exists(JSON_PATH):
            return

        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        old_tools = data.get("os_tools", [])
        current_version = data.get("metadata", {}).get("version", "1.0.0")

        # 1. Deduplicate and Sort
        seen_ids = set()
        unique_tools = []
        for tool in old_tools:
            uid = f"{tool['platforms'].get('win32')}-{tool['platforms'].get('darwin')}"
            if uid not in seen_ids:
                unique_tools.append(tool)
                seen_ids.add(uid)
        
        unique_tools.sort(key=lambda x: x['name'].lower())

        # 2. Logic for Bundled Changes
        has_new_tools = len(unique_tools) > len(old_tools)
        old_content = json.dumps(old_tools, sort_keys=True)
        new_content = json.dumps(unique_tools, sort_keys=True)
        has_fixes = (old_content != new_content) and not has_new_tools

        # 3. Version and Timestamp
        new_version = increment_version(current_version, has_new_tools, has_fixes) if (has_new_tools or has_fixes) else current_version
        current_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 4. Save JSON
        new_structure = {
            "metadata": {"version": new_version, "updated": current_now},
            "os_tools": unique_tools
        }
        
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(new_structure, f, indent=4, ensure_ascii=False)

        # 5. Auto-update README Stats
        if os.path.exists(README_PATH):
            with open(README_PATH, 'r', encoding='utf-8') as f:
                content = f.read()

            stats_pattern = r".*?"
            new_stats = (
                f"\n"
                f"**Current Version:** `{new_version}`  \n"
                f"**Total Tools Verified:** `{len(unique_tools)}`  \n"
                f"**Last Updated:** `{current_now}`\n"
                f""
            )
            updated_readme = re.sub(stats_pattern, new_stats, content, flags=re.DOTALL)
            
            with open(README_PATH, 'w', encoding='utf-8') as f:
                f.write(updated_readme)
        
        print(f"✅ Registry Maintenance Complete: v{new_version}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reformat_registry()