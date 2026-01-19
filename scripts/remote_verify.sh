#!/bin/bash

if [ ! -z "$REQ_WIN_ID" ]; then
  FIRST_LETTER=$(echo "${REQ_WIN_ID:0:1}" | tr '[:upper:]' '[:lower:]')
  PART_PATH=$(echo "$REQ_WIN_ID" | tr '.' '/')
  WIN_URL="https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/$FIRST_LETTER/$PART_PATH"
  
  echo "🔍 Checking WinGet ID: $REQ_WIN_ID"
  
  WIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "$WIN_URL")
  
  if [ "$WIN_STATUS" == "200" ]; then 
    echo "WIN_DATA={\"found\":true}" >> $GITHUB_ENV
    echo "✅ WinGet ID found."
  else
    echo "WIN_DATA={\"found\":false}" >> $GITHUB_ENV
    echo "❌ WinGet ID not found (Status: $WIN_STATUS)."
  fi
fi

if [ ! -z "$REQ_BREW_ID" ]; then
  echo "🔍 Checking Homebrew ID: $REQ_BREW_ID"
  
  B_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://formulae.brew.sh/api/formula/${REQ_BREW_ID}.json")
  C_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://formulae.brew.sh/api/cask/${REQ_BREW_ID}.json")
  
  if [ "$B_CODE" == "200" ] || [ "$C_CODE" == "200" ]; then 
    echo "BREW_DATA={\"found\":true}" >> $GITHUB_ENV
    echo "✅ Homebrew ID found."
  else
    echo "BREW_DATA={\"found\":false}" >> $GITHUB_ENV
    echo "❌ Homebrew ID not found."
  fi
fi