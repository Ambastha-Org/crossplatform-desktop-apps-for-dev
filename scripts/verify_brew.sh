#!/bin/bash
echo "🚀 Scanning for Darwin ID changes..."

CHANGED_IDS=$(git diff origin/main -U0 os_tools.json | grep -oP '"darwin":\s*"\K[^"]+')

if [ -z "$CHANGED_IDS" ]; then
    echo "✅ No Darwin ID changes detected."
    exit 0
fi

for id in $CHANGED_IDS; do
    echo "🔎 Testing: $id"
    if ! brew info --cask "$id" >/dev/null 2>&1 && ! brew info "$id" >/dev/null 2>&1; then
        echo "❌ ID Not Found. Searching for alternatives..."
        SUGGESTION=$(brew search "$id" | head -n 1)
        
        echo "suggestion=$SUGGESTION" >> $GITHUB_OUTPUT
        echo "failed_id=$id" >> $GITHUB_OUTPUT
        exit 1
    fi
done

echo "✅ All Homebrew IDs verified."