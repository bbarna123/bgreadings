# Blood Sugar Readings API

## Overview
This repository stores blood sugar readings in a CSV file that can be updated via GitHub API.

## CSV Format
The `data/readings.csv` file contains blood sugar readings with the following columns:

```
timestamp,reading_mg_dl,notes
2026-06-22T08:00:00Z,120,Fasting
2026-06-22T09:30:00Z,145,After breakfast
```

- **timestamp**: ISO 8601 format (e.g., `2026-06-22T08:00:00Z`)
- **reading_mg_dl**: Blood sugar reading in mg/dL (numeric value)
- **notes**: Optional description (e.g., "Fasting", "After breakfast")

## Pushing Data via API

### Method 1: Using GitHub REST API (Recommended)

#### 1. Get current file SHA
```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/bbarna123/bgreadings/contents/data/readings.csv
```

This returns a response with a `sha` value. Save this.

#### 2. Update the file
```bash
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/bbarna123/bgreadings/contents/data/readings.csv \
  -d '{
    "message": "Add blood sugar reading",
    "content": "'"$(base64 -w 0 < data/readings.csv)"'",
    "sha": "CURRENT_SHA_VALUE"
  }'
```

### Method 2: Using JavaScript/Node.js

```javascript
const axios = require('axios');
const fs = require('fs');

const GITHUB_TOKEN = 'your_github_token';
const REPO_OWNER = 'bbarna123';
const REPO_NAME = 'bgreadings';
const FILE_PATH = 'data/readings.csv';

async function addReading(reading_mg_dl, notes = '') {
  try {
    // 1. Get current file
    const getResponse = await axios.get(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      }
    );

    // 2. Decode current content
    const currentContent = Buffer.from(getResponse.data.content, 'base64').toString('utf-8');

    // 3. Add new line
    const timestamp = new Date().toISOString();
    const newLine = `${timestamp},${reading_mg_dl},${notes}\n`;
    const updatedContent = currentContent + newLine;

    // 4. Encode and push
    const encodedContent = Buffer.from(updatedContent).toString('base64');
    
    await axios.put(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        message: `Add blood sugar reading: ${reading_mg_dl} mg/dL`,
        content: encodedContent,
        sha: getResponse.data.sha
      },
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      }
    );

    console.log('Reading added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage
addReading(125, 'After breakfast');
```

### Method 3: Using Python

```python
import requests
import base64
from datetime import datetime

GITHUB_TOKEN = 'your_github_token'
REPO_OWNER = 'bbarna123'
REPO_NAME = 'bgreadings'
FILE_PATH = 'data/readings.csv'

def add_reading(reading_mg_dl, notes=''):
    headers = {'Authorization': f'token {GITHUB_TOKEN}'}
    
    # Get current file
    url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}'
    response = requests.get(url, headers=headers)
    data = response.json()
    
    # Decode current content
    current_content = base64.b64decode(data['content']).decode('utf-8')
    
    # Add new line
    timestamp = datetime.utcnow().isoformat() + 'Z'
    new_line = f'{timestamp},{reading_mg_dl},{notes}\n'
    updated_content = current_content + new_line
    
    # Encode and push
    encoded_content = base64.b64encode(updated_content.encode()).decode()
    
    response = requests.put(
        url,
        headers=headers,
        json={
            'message': f'Add blood sugar reading: {reading_mg_dl} mg/dL',
            'content': encoded_content,
            'sha': data['sha']
        }
    )
    
    if response.status_code == 200:
        print('Reading added successfully!')
    else:
        print(f'Error: {response.status_code}')

# Usage
add_reading(125, 'After breakfast')
```

## Getting Your GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select these scopes:
   - `repo` (full control of private repositories)
4. Click "Generate token"
5. Copy and save the token securely

## Frontend Usage

The React frontend automatically fetches the latest 20 readings from the CSV file and displays them in a chart.

Visit the deployed site to see your readings visualized in real-time!
