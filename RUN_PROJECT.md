# 🚀 How to Run This Project

## Prerequisites
- Node.js installed (download from nodejs.org)
- Terminal/PowerShell access

## Step 1: Open Terminal in Project Folder

**Windows:**
1. Navigate to the project folder: `my-web-project`
2. Right-click and select "Open in Terminal" or "Open PowerShell here"

**Or use the command line:**
```bash
cd my-web-project
```

## Step 2: Install Backend Dependencies

If you haven't already installed dependencies:
```bash
npm install
```

## Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 4: Start the Backend Server

In your terminal, run:
```bash
node server.js
```

You should see:
```
Server running on port 3001
FindChips component search service is ready
```

✅ **Backend is now running!**

## Step 5: Start the Frontend (in a NEW terminal)

Open a **NEW terminal window** (don't close the backend terminal!), then:

```bash
cd my-web-project/frontend
npm start
```

Wait for it to compile and open your browser automatically at `http://localhost:3000`

✅ **Frontend is now running!**

## Step 6: Use the Application

1. Open your browser to `http://localhost:3000`
2. Enter a part number (e.g., "LM358" or "1N4148")
3. Click "Search"
4. View the results in the table
5. Check the `Components.xlsx` file - data is automatically saved there!

## Troubleshooting

### If port 3001 is already in use:
- Stop the existing server (Ctrl+C)
- Or change the port in `server.js` line 22

### If port 3000 is already in use:
- The frontend will ask to use a different port
- Press 'Y' and use the new port number

### If you get "module not found" errors:
- Run `npm install` again in both directories
- Make sure `node_modules` folders exist

## Quick Start (Alternative)

If both dependencies are already installed, you can:

**Terminal 1 (Backend):**
```bash
cd my-web-project
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd my-web-project/frontend
npm start
```

## What's Running

✅ **Backend** (port 3001): Handles data fetching and Excel storage  
✅ **Frontend** (port 3000): Web interface for searching components

## Features

- ✅ Search components from FindChips
- ✅ Auto-save to Excel file
- ✅ Display results in a table
- ✅ Clear history button
- ✅ FindChips format data extraction

Enjoy! 🎉
