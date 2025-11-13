#!/bin/bash

# Script to update all frontend files to use API_BASE_URL

FILES=(
  "Home.jsx"
  "Chat.jsx"
  "Flashcards.jsx"
  "quiz.jsx"
  "Analytics.jsx"
  "Planner.jsx"
)

cd /Users/jarvis/Desktop/study-buddy/frontend/src/pages

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Check if import already exists
    if ! grep -q "import API_BASE_URL" "$file"; then
      # Add import after axios import or at the beginning
      if grep -q "import axios" "$file"; then
        sed -i '' '/import axios/a\
import API_BASE_URL from "../config/api";
' "$file"
      else
        sed -i '' '1i\
import API_BASE_URL from "../config/api";
' "$file"
      fi
    fi
    
    # Replace URL patterns
    sed -i '' 's|"REPLACE_API_URL|`${API_BASE_URL}|g' "$file"
    sed -i '' "s|'REPLACE_API_URL|\\`\\${API_BASE_URL}|g" "$file"
    sed -i '' 's|/api/|/api/|g' "$file"
    
    echo "✓ $file updated"
  fi
done

echo "All files updated!"
