import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(BASE_DIR, 'os_tools.json')
VERSION = "1.0.0"

def reformat_registry():
    try:
        if not os.path.exists(JSON_PATH):
            print(f"❌ Error: {JSON_PATH} not found.")
            return

        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if isinstance(data, dict) and "os_tools" in data:
            raw_list = data["os_tools"]
        else:
            raw_list = data if isinstance(data, list) else []

        current_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_structure = {
            "metadata": {
                "version": VERSION,
                "updated": current_now
            },
            "os_tools": raw_list
        }

        is_already_structured = isinstance(data, dict) and "metadata" in data
        
        if is_already_structured:
            old_updated = data["metadata"].get("updated", "")
            if data.get("os_tools") == raw_list and len(old_updated) == len(current_now):
                print(f"✨ Registry is already perfectly formatted. (Last: {old_updated})")
                return

        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(new_structure, f, indent=4)
        
        print(f"✅ Successfully updated! Tools: {len(raw_list)}")
        print(f"⏰ Timestamp: {current_now}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reformat_registry()