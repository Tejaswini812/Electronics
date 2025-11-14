# 🚀 START HERE - Quick Setup Guide

## ⚡ Quick Start (Windows)

### Step 1: Install Dependencies (Run Once)

Open Command Prompt in the `my-web-project` folder and run:

```bash
npm install
cd frontend
npm install
cd ..
```

### Step 2: Start the Backend Server

**Option A: Using the batch file (Easiest)**
```bash
start-server.bat
```

**Option B: Manual start**
```bash
node server.js
```

You should see:
```
Server running on port 3001
FindChips component search service is ready
```

### Step 3: Start the Frontend (In a NEW Terminal)

Open a **NEW** Command Prompt window and run:

```bash
cd my-web-project/frontend
npm start
```

Your browser should automatically open to http://localhost:3000

### Step 4: Test It!

1. Enter a part number like: **LM358**
2. Click "Search"
3. Wait a few seconds
4. Data will be extracted and saved to **Components.xlsx**

## 📊 What Gets Extracted

- ✅ Part Number
- ✅ Description
- ✅ Price
- ✅ Distributor
- ✅ Manufacturer
- ✅ Stock information
- ✅ Datasheet link

All data is automatically saved to **Components.xlsx** file!

## 🔍 Test Part Numbers

Try these examples:
- LM358
- 1N4148
- 74HC595
- ATmega328P

## ⚠️ Troubleshooting

**Error: "Port 3001 already in use"**
- Close any other programs using port 3001
- Or change the port in server.js

**Error: "Cannot find module"**
- Run `npm install` again in both root and frontend folders

**Data not showing?**
- Check the browser console for errors
- Check the server terminal for parsing logs
- The HTML structure might have changed

## 📝 Notes

- The Excel file (Components.xlsx) is created automatically after the first search
- All searches are limited to 30 per minute to respect FindChips
- Data is for academic/research use only
