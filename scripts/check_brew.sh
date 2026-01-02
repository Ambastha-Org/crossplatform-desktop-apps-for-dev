#!/bin/bash
ID=$1
if brew info --cask "$ID" >/dev/null 2>&1 || brew info "$ID" >/dev/null 2>&1; then
    echo "found=true"
    echo "suggestion=$ID"
else
    echo "found=false"
    # Search for similar items
    SUGGESTIONS=$(brew search "$ID" | head -n 15 | sed 's/^/- /')
    if [ -z "$SUGGESTIONS" ]; then
        echo "suggestion=none"
    else
        echo "suggestion<<EOF" >> $GITHUB_OUTPUT
        echo "$SUGGESTIONS" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
    fi
fi