#!/bin/bash
ID=$1
if winget show --id "$ID" --accept-source-agreements >/dev/null 2>&1; then
    echo "found=true"
    echo "suggestion=$ID"
else
    echo "found=false"
    SUGGESTIONS=$(winget search "$ID" | tail -n +5 | head -n 15 | awk '{print "- " $1 " (" $2 ")"}')
    if [ -z "$SUGGESTIONS" ]; then
        echo "suggestion=none"
    else
        echo "suggestion<<EOF" >> $GITHUB_OUTPUT
        echo "$SUGGESTIONS" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
    fi
fi