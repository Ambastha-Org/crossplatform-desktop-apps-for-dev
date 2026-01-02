#!/usr/bin/env python3
import json
import sys
import os
import re
from datetime import datetime

def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or 'tool'

def main():
    if len(sys.argv) < 2:
        print('Usage: add_tool_entry.py <entry.json>')
        sys.exit(1)

    entry_path = sys.argv[1]
    if not os.path.exists(entry_path):
        print(f'Entry file not found: {entry_path}')
        sys.exit(1)

    with open(entry_path, 'r', encoding='utf-8') as f:
        incoming_data = json.load(f)

    if "win_id" in incoming_data or "brew_id" in incoming_data:
        platforms = {}
        if incoming_data.get("win_id"): platforms["win32"] = incoming_data["win_id"]
        if incoming_data.get("brew_id"): platforms["darwin"] = incoming_data["brew_id"]
        
        entry = {
            "name": incoming_data.get("name") or "New Tool",
            "platforms": platforms,
            "description": incoming_data.get("description") or "Added via automated tool request 🤖"
        }
    else:
        entry = incoming_data.get('entry', incoming_data)

    tool_id = entry.get('id') or slugify(entry.get('name', 'tool'))
    tool_name = entry.get('name') or tool_id
    description = entry.get('description', '')
    new_platforms = entry.get('platforms', {})

    os_tools_path = os.path.join(os.getcwd(), 'os_tools.json')
    
    if not os.path.exists(os_tools_path):
        registry = {"metadata": {"version": "1.0.0"}, "os_tools": []}
    else:
        with open(os_tools_path, 'r', encoding='utf-8') as f:
            registry = json.load(f)

    tools = registry.get('os_tools', [])

    for t in tools:
        # Skip checking the tool if it's the one we are actually updating (by ID)
        if t.get('id') == tool_id:
            continue
        
        for p_key, p_val in new_platforms.items():
            if t.get('platforms', {}).get(p_key) == p_val:
                print(f"❌ ERROR: Platform ID '{p_val}' is already assigned to '{t.get('id')}'.")
                sys.exit(1) # Fail the workflow

    for t in tools:
        if t.get('id') == tool_id:
            print(f"🔄 Updating existing entry: {tool_id}")
            t.update({
                "name": tool_name,
                "description": description if description else t.get('description')
            })
            t.setdefault('platforms', {}).update(new_platforms)
            break
    else:
        tools.append({
            'id': tool_id,
            'name': tool_name,
            'description': description,
            'platforms': new_platforms
        })
        print(f"✨ Added new tool: {tool_id}")

    registry['os_tools'] = tools
    registry.setdefault('metadata', {})['updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    with open(os_tools_path, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)

if __name__ == '__main__':
    main()