# 🚀 How to Start the Project on Localhost

## Prerequisites
- Node.js installed (version 14 or higher)
- npm (comes with Node.js)

## Step-by-Step Instructions

### Step 1: Open Terminal/Command Prompt
You'll need **TWO terminal windows** - one for the backend server and one for the frontend.

---

### Step 2: Start Backend Server (Terminal 1)

1. **Open first terminal window**
2. **Navigate to project folder:**
   ```bash
   cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project
   ```
   
3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```
   
4. **Start the backend server:**
   ```bash
   npm start
   ```
   
5. **You should see:**
   ```
   Server running on port 3001
   FindChips component search service is ready
   ```
   
6. **✅ Keep this terminal window OPEN** - the backend server is now running on `http://localhost:3001`

---

### Step 3: Start Frontend Server (Terminal 2)

1. **Open a NEW terminal window** (don't close Terminal 1!)
2. **Navigate to frontend folder:**
   ```bash
   cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project\frontend
   ```
   
3. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```
   
4. **Start the frontend server:**
   ```bash
   npm start
   ```
   
5. **You should see:**
   ```
   Compiled successfully!
   
   You can now view component-search-frontend in the browser.
   
     Local:            http://localhost:3000
   ```
   
6. **Your browser should automatically open** to `http://localhost:3000`
   
7. **✅ Keep this terminal window OPEN** - the frontend is now running

---

## ✅ Project is Now Running!

### What You Should See:

**Terminal 1 (Backend):**
```
Server running on port 3001
FindChips component search service is ready
```

**Terminal 2 (Frontend):**
```
Compiled successfully!
webpack compiled with 0 warnings
```

**Browser:**
- Opens automatically to `http://localhost:3000`
- Shows the "Semicon Ventures" website with component search

---

## 🎯 Quick Reference Commands

### Terminal 1 (Backend):
```bash
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project
npm start
```

### Terminal 2 (Frontend):
```bash
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project\frontend
npm start
```

---

## 🔧 Troubleshooting

### Problem: Port 3001 already in use
**Solution:**
```bash
# Kill the process using port 3001
taskkill /f /im node.exe
# Then try npm start again
```

### Problem: Port 3000 already in use
**Solution:**
- The React app will ask if you want to use a different port
- Type `Y` and press Enter
- It will use port 3001 or 3002 instead

### Problem: Module not found errors
**Solution:**
```bash
# Run in both directories:
npm install
```

### Problem: Excel file is locked
**Solution:**
- Close Excel if the Components.xlsx file is open
- The server will create a new file automatically

---

## 📋 Project Structure

```
my-web-project/
├── server.js          ← Backend server (Terminal 1)
├── package.json       ← Backend dependencies
├── Components.xlsx    ← Generated Excel file
└── frontend/
    ├── src/
    │   ├── App.js     ← Frontend React app
    │   └── App.css    ← Styles
    ├── package.json   ← Frontend dependencies
    └── npm start      ← Frontend server (Terminal 2)
```

---

## 🛑 To Stop the Servers

**In each terminal window, press:**
```
Ctrl + C
```

This will stop the server in that terminal.

---

## ✅ Success Checklist

- [ ] Terminal 1 shows "Server running on port 3001"
- [ ] Terminal 2 shows "Compiled successfully"
- [ ] Browser opens to http://localhost:3000
- [ ] You can see "Semicon Ventures" header
- [ ] You can search for components (e.g., "LM358")

---

## 🎉 You're Ready to Go!

Once both servers are running, you can:
- Search for components by part number
- View pricing, stock, and distributor information
- Data is automatically saved to Components.xlsx
- Clear history when needed

Enjoy using the Component Search System! 🚀
