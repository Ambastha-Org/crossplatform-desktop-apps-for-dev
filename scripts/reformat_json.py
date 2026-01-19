import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)
JSON_PATH = os.path.join(ROOT_DIR, "os_tools.json")

def increment_version(version_str, change_type):
    """Increments version based on SemVer: major.minor.patch"""
    parts = list(map(int, version_str.split('.')))
    if change_type == "minor":
        parts[1] += 1
        parts[2] = 0
    elif change_type == "patch":
        parts[2] += 1
    return ".".join(map(str, parts))

def reorder_registry():
    try:
        if not os.path.exists(JSON_PATH): return

        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        original_tools = json.dumps(data.get("os_tools", []), sort_keys=True)
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

        change_type = data["metadata"].get("change")
        if change_type in ["minor", "patch"]:
            current_ver = data["metadata"].get("version", "1.0.0")
            new_ver = increment_version(current_ver, change_type)
            data["metadata"]["version"] = new_ver
            del data["metadata"]["change"]
            print(f"🚀 Version bumped to {new_ver} ({change_type})")

        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reorder_registry()