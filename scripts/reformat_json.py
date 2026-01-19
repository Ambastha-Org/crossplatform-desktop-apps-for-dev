import json
import os
import re
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)
JSON_PATH = os.path.join(ROOT_DIR, "os_tools.json")
README_PATH = os.path.join(ROOT_DIR, "README.md")

def increment_version(version_str, change_type):
    parts = list(map(int, version_str.split('.')))
    if change_type == "minor":
        parts[1] += 1
        parts[2] = 0
    elif change_type == "patch":
        parts[2] += 1
    return ".".join(map(str, parts))

def update_readme(version, total_tools):
    if not os.path.exists(README_PATH): return
    
    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(r"(\*\*Current Version:\*\* `)(.*)(`)", f"\\1{version}\\3", content)
    content = re.sub(r"(\*\*Total Tools Verified:\*\* `)(.*)(`)", f"\\1{total_tools}\\3", content)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content = re.sub(r"(\*\*Last Updated:\*\* `)(.*)(`)", f"\\1{now_str}\\3", content)

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(content)

def reorder_registry():
    try:
        if not os.path.exists(JSON_PATH): return

        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        tools = data.get("os_tools", [])
        
        seen = set()
        unique_tools = []
        for tool in tools:
            key = tool.get("id", "").lower()
            if key not in seen:
                seen.add(key)
                unique_tools.append(tool)
        
        unique_tools.sort(key=lambda x: re.sub(r"[^a-z0-9]", "", x.get("id", "").lower()))
        data["os_tools"] = unique_tools

        current_ver = data["metadata"].get("version", "1.0.0")
        change_type = data["metadata"].get("change")
        
        if change_type:
            new_ver = increment_version(current_ver, change_type)
            data["metadata"]["version"] = new_ver
            data["metadata"]["updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            del data["metadata"]["change"]
            
            update_readme(new_ver, len(unique_tools))
            print(f"🚀 Registry & README updated to v{new_ver}")

        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reorder_registry()