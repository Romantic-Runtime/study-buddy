#!/usr/bin/env python3
import os
import re

# Directory containing the JSX files
pages_dir = "/Users/jarvis/Desktop/study-buddy/frontend/src/pages"

# Files to update
files_to_update = [
    "Home.jsx", "Chat.jsx", "Flashcards.jsx", 
    "quiz.jsx", "Analytics.jsx", "Planner.jsx"
]

for filename in files_to_update:
    filepath = os.path.join(pages_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"Skipping {filename} - not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add import if not present
    if 'import API_BASE_URL from' not in content:
        # Find the line with 'import axios'
        if 'import axios' in content:
            content = content.replace(
                'import axios from "axios";',
                'import axios from "axios";\nimport API_BASE_URL from "../config/api";'
            ).replace(
                "import axios from 'axios';",
                "import axios from 'axios';\nimport API_BASE_URL from '../config/api';"
            )
    
    # Replace all URL patterns
    content = re.sub(
        r'["\']REPLACE_API_URL/api/([^"\'`]+)["\']',
        r'`${API_BASE_URL}/api/\1`',
        content
    )
    
    content = re.sub(
        r'`\$\{API_BASE_URL\}/api/([^`]+)["\']',
        r'`${API_BASE_URL}/api/\1`',
        content
    )
    
    # Write back
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Updated {filename}")

print("\nAll files updated successfully!")
