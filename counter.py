import json

def count_registry_apps(file_path):
    """
    Reads the Universal Dev Registry JSON and counts items in os_tools.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
            apps = data.get("os_tools", [])
            
            count = len(apps)
            print(f"🚀 Registry Owner: {data['header']['owner']}")
            print(f"✅ Total Apps Listed in os_tools: {count}")
            return count
            
    except FileNotFoundError:
        print("❌ Error: The file 'registry.json' was not found.")
    except json.JSONDecodeError:
        print("❌ Error: Failed to decode JSON. Check for trailing commas!")
    except KeyError as e:
        print(f"❌ Error: Missing expected key in JSON: {e}")

count_registry_apps('os_tools.json')