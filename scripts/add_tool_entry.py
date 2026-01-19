#!/usr/bin/env python3
import json
import sys
import os
import re
from datetime import datetime

def slugify(name: str) -> str:
    """Standardizes IDs to lowercase underscore format."""
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "tool"

def die(msg: str, code: int = 1):
    print(msg)
    sys.exit(code)

def main():
    if len(sys.argv) < 2:
        die("Usage: add_tool_entry.py <entry.json>")

    entry_path = sys.argv[1]
    if not os.path.exists(entry_path):
        die(f"❌ Entry file not found: {entry_path}")

    with open(entry_path, "r", encoding="utf-8") as f:
        incoming_data = json.load(f)

    if "win_id" in incoming_data or "brew_id" in incoming_data:
        platforms = {}
        if incoming_data.get("win_id"):
            platforms["win32"] = incoming_data["win_id"]
        if incoming_data.get("brew_id"):
            platforms["darwin"] = incoming_data["brew_id"]

        entry = {
            "name": incoming_data.get("name") or "New Tool",
            "description": incoming_data.get("description") or "Added via automated tool request 🤖",
            "platforms": platforms,
        }
    else:
        entry = incoming_data.get("entry", incoming_data)

    tool_id = entry.get("id") or slugify(entry.get("name", "tool"))
    tool_name = entry.get("name") or tool_id
    description = entry.get("description", "")
    new_platforms = entry.get("platforms", {})

    os_tools_path = os.path.join(os.getcwd(), "os_tools.json")

    if not os.path.exists(os_tools_path):
        registry = {
            "metadata": {
                "version": "1.0.0",
                "updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            },
            "os_tools": [],
        }
    else:
        with open(os_tools_path, "r", encoding="utf-8") as f:
            registry = json.load(f)

    tools = registry.get("os_tools", [])
    
    for t in tools:
        if t.get("id") == tool_id:
            continue
        for p_key, p_val in new_platforms.items():
            if p_val and t.get("platforms", {}).get(p_key) == p_val:
                die(f"❌ ERROR: Platform ID '{p_val}' is already claimed by '{t.get('id')}'")

    found = False
    change_type = None

    for t in tools:
        if t.get("id") == tool_id:
            print(f"🔄 Ambastha Update: {tool_id}")
            
            if t.get("name") != tool_name or t.get("platforms") != new_platforms:
                change_type = "patch"

            t["name"] = tool_name
            
            current_desc = t.get("description", "").lower()
            if "automated tool request" in current_desc or not current_desc:
                if t.get("description") != description:
                    t["description"] = description
                    change_type = "patch"
            
            t.setdefault("platforms", {}).update(new_platforms)
            found = True
            break

    if not found:
        tools.append({
            "id": tool_id,
            "name": tool_name,
            "description": description,
            "platforms": new_platforms,
        })
        change_type = "minor"  
        print(f"✨ Ambastha New Entry: {tool_id}")

    tools.sort(key=lambda x: re.sub(r"[^a-z0-9]", "", x.get("id", "").lower()))

    registry["os_tools"] = tools
    registry.setdefault("metadata", {})
    registry["metadata"]["updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if change_type:
        registry["metadata"]["change"] = change_type

    with open(os_tools_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)