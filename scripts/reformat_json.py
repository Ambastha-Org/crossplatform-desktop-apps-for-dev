import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)  # project root
JSON_PATH = os.path.join(ROOT_DIR, "os_tools.json")


def reorder_registry():
    try:
        if not os.path.exists(JSON_PATH):
            print(f"❌ File not found: {JSON_PATH}")
            return

        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        tools = data.get("os_tools", [])

        seen = set()
        unique_tools = []
        for tool in tools:
            key = (
                tool.get("platforms", {}).get("win32"),
                tool.get("platforms", {}).get("darwin"),
            )
            if key not in seen:
                seen.add(key)
                unique_tools.append(tool)

        def sort_key(tool):
            return re.sub(r"[^a-z0-9]", "", tool.get("id", "").lower())

        unique_tools.sort(key=sort_key)

        data["os_tools"] = unique_tools

        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        print(f"✅ Registry reordered successfully. Total tools: {len(unique_tools)}")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    reorder_registry()
