# 📊 Blood Sugar Readings Tracker

A complete blood sugar monitoring solution with:
- **React frontend** for visualizing readings with an interactive chart
- **CSV storage** in GitHub for easy data management
- **API integration** to push new readings programmatically

## Features

✅ **Real-time Chart** - Visualize last 20 blood sugar readings  
✅ **Statistics Dashboard** - See average, min, and max readings  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **GitHub Storage** - Data stored in version-controlled CSV file  
✅ **API-ready** - Push readings from any app or device  
✅ **No Backend** - Serverless architecture using GitHub as backend  

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/bbarna123/bgreadings.git
cd bgreadings
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. View Your Readings

The chart automatically loads from `data/readings.csv` and displays the latest 20 readings.

## Adding Readings via API

### Option 1: Manual CSV Update
Edit `data/readings.csv` and add a new line:
```csv
2026-06-22T10:00:00Z,135,After snack
```

### Option 2: Automated API Push
See [API.md](./API.md) for detailed instructions using:
- cURL
- JavaScript/Node.js
- Python

#### Quick Example (JavaScript):
```javascript
const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({
  auth: 'YOUR_GITHUB_TOKEN'
});

async function addReading(reading_mg_dl, notes = '') {
  const timestamp = new Date().toISOString();
  const newLine = `${timestamp},${reading_mg_dl},${notes}\n`;
  
  // Get current file
  const { data } = await octokit.repos.getContent({
    owner: 'bbarna123',
    repo: 'bgreadings',
    path: 'data/readings.csv'
  });
  
  // Append new reading
  const content = Buffer.from(data.content, 'base64').toString() + newLine;
  
  // Push to GitHub
  await octokit.repos.createOrUpdateFileContents({
    owner: 'bbarna123',
    repo: 'bgreadings',
    path: 'data/readings.csv',
    message: `Add blood sugar reading: ${reading_mg_dl} mg/dL`,
    content: Buffer.from(content).toString('base64'),
    sha: data.sha
  });
}
```

## Data Format

Readings are stored in CSV format: `data/readings.csv`

```csv
timestamp,reading_mg_dl,notes
2026-06-22T08:00:00Z,120,Fasting
2026-06-22T09:30:00Z,145,After breakfast
2026-06-22T12:00:00Z,118,Before lunch
```

- **timestamp**: ISO 8601 format (e.g., `2026-06-22T08:00:00Z`)
- **reading_mg_dl**: Blood sugar value in mg/dL
- **notes**: Optional notes (e.g., "Fasting", "After meal", "Exercise")

## Frontend Usage

### Components

- **Statistics Panel**: Shows average, min, max readings and count
- **Line Chart**: Interactive chart of last 20 readings with hover details
- **Add Reading Form**: Quick entry for new readings (frontend only)
- **Recent Readings Table**: Detailed table with color-coded values

### Color Coding

- 🔴 **High** (>180 mg/dL) - Red
- 🟡 **Normal** (70-180 mg/dL) - Green
- 🟠 **Low** (<70 mg/dL) - Orange

## Deployment

### GitHub Pages

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Netlify

1. Push to GitHub
2. Connect repo at https://netlify.com
3. Set build command: `npm run build`
4. Set publish directory: `build`

### Vercel

1. Push to GitHub
2. Import project at https://vercel.com
3. Click deploy!

## Project Structure

```
bgreadings/
├── data/
│   └── readings.csv          # Blood sugar data storage
├── public/
│   ├── index.html            # HTML entry point
│   └── index.js              # React initialization
├── src/
│   ├── App.js                # Main React component
│   ├── App.css               # Styling
│   └── index.js              # React DOM render
├── package.json              # Dependencies
├── API.md                    # API documentation
└── README.md                 # This file
```

## Technology Stack

- **React 18** - UI framework
- **Recharts** - Chart visualization
- **GitHub REST API** - Data backend
- **CSV** - Data storage format

## Requirements

- Node.js 14+ and npm
- GitHub account (for storing data)
- GitHub Personal Access Token (for API pushes)

## Setting Up GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `repo` scope
4. Copy the token and use it for API calls

**Keep your token secret!** Never commit it to the repository.

## Troubleshooting

### Chart not showing data
- Check that `data/readings.csv` exists in the repo
- Verify the CSV format is correct
- Check browser console for errors

### API push fails
- Verify your GitHub token is valid
- Check token has `repo` scope
- Ensure file SHA is current (get it fresh before each push)

### Local development issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Check Node version: `node --version` (should be 14+)

## License

MIT

## Support

For issues or questions:
1. Check [API.md](./API.md) for implementation examples
2. Review the GitHub issues
3. Check your GitHub token permissions

---

**Happy tracking! 📈** Track your blood sugar, improve your health.
