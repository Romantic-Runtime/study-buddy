#!/usr/bin/env python3
import os
import re

pages_dir = "/Users/jarvis/Desktop/study-buddy/frontend/src/pages"
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
    
    # Remove duplicate axiosInstance import if it was added at line 1
    content = re.sub(r'import axiosInstance from "\.\.\/axiosInstance";\n', '', content, count=1)
    
    # Replace: import axios from "axios";
    # With: import axiosInstance from "../axiosInstance";
    content = re.sub(
        r'import axios from ["\']axios["\'];',
        'import axiosInstance from "../axiosInstance";',
        content
    )
    
    # Remove API_BASE_URL import if it exists
    content = re.sub(
        r'\nimport API_BASE_URL from ["\'][\.\/]+config\/api["\'];\n',
        '\n',
        content
    )
    
    # Replace axios.post/get/patch/delete calls
    # Pattern: axios.method(`${API_BASE_URL}/path`, ...)
    # To: axiosInstance.method('/path', ...)
    
    # Match axios.post(`${API_BASE_URL}/api/...
    content = re.sub(
        r'axios\.(post|get|patch|delete|put)\(\s*`\$\{API_BASE_URL\}(/api/[^`]+)`',
        r'axiosInstance.\1(\'\2\'',
        content
    )
    
    # Match axios.post("${API_BASE_URL}/api/...
    content = re.sub(
        r'axios\.(post|get|patch|delete|put)\(\s*["\']?\$\{API_BASE_URL\}(/api/[^"\']+)["\']?',
        r'axiosInstance.\1(\'\2\'',
        content
    )
    
    # Match axios.post(`${API_BASE_URL}/api/...
    content = re.sub(
        r'axios\.(post|get|patch|delete|put)\(\s*`\$\{API_BASE_URL\}(/api/[^`\)]+)`',
        r'axiosInstance.\1(\'\2\'',
        content
    )
    
    # Remove withCredentials from axiosInstance calls (already in interceptor)
    content = re.sub(
        r',\s*\{\s*withCredentials:\s*true\s*\}',
        '',
        content
    )
    
    # Write back
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Updated {filename}")

print("\nAll files updated!")
