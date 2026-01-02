#!/bin/bash
ID="${REQ_BREW_ID:-$1}"
if [ -z "$ID" ]; then
    echo "RESULT_JSON={\"found\":false,\"suggestion\":\"\",\"platform\":\"homebrew\"}"
    exit 0
fi

FOUND=false
SUGGESTION=""

if brew info --cask "$ID" >/dev/null 2>&1 || brew info "$ID" >/dev/null 2>&1; then
    FOUND=true
    SUGGESTION="$ID"
else
    SUGGESTION=$(brew search "$ID" | head -n 1 | awk '{print $1}')
    if [ -z "$SUGGESTION" ]; then
        SUGGESTION="none"
    fi
fi

SUGGESTION_ESCAPED=$(printf '%s' "$SUGGESTION" | sed 's/"/\\"/g')
echo "RESULT_JSON={\"found\": ${FOUND}, \"suggestion\": \"${SUGGESTION_ESCAPED}\", \"platform\": \"homebrew\"}"