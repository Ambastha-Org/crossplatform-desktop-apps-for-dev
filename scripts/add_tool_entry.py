#!/usr/bin/env python3
import json
import sys
import os
from datetime import datetime

def slugify(name: str) -> str:
    import re
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
        
        suggested_name = incoming_data.get("win_id") or incoming_data.get("brew_id") or "new_tool"
        entry = {
            "name": suggested_name.split('.')[-1] if '.' in suggested_name else suggested_name,
            "platforms": platforms,
            "description": "Added via automated tool request."
        }
    elif isinstance(incoming_data, dict) and 'entry' in incoming_data:
        entry = incoming_data['entry']
    else:
        entry = incoming_data

    tool_id = entry.get('id') or slugify(entry.get('name', 'tool'))
    tool_name = entry.get('name') or tool_id
    description = entry.get('description', '')
    platforms = entry.get('platforms', {}) or {}

    repo_root = os.getcwd()
    os_tools_path = os.path.join(repo_root, 'os_tools.json')
    
    if not os.path.exists(os_tools_path):
        print('os_tools.json not found. Initializing new registry...')
        registry = {"metadata": {"version": "1.0.0"}, "os_tools": []}
    else:
        with open(os_tools_path, 'r', encoding='utf-8') as f:
            registry = json.load(f)

    tools = registry.get('os_tools', [])
    
    for t in tools:
        if t.get('id') == tool_id:
            print(f"Tool with id '{tool_id}' already exists. Updating existing entry.")
            t.update({
                "name": tool_name,
                "description": description if description else t.get('description')
            })
            t.setdefault('platforms', {}).update(platforms)
            break
    else:
        new_tool = {
            'id': tool_id,
            'name': tool_name,
            'description': description,
            'platforms': platforms
        }
        tools.append(new_tool)
        print(f"Added new tool: {tool_id}")

    registry['os_tools'] = tools
    registry.setdefault('metadata', {})['updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    with open(os_tools_path, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)

    print('os_tools.json successfully updated')

if __name__ == '__main__':
    main()