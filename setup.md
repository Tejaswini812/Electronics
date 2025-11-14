# Quick Setup Guide

## First Time Setup

1. **Install backend dependencies:**
```bash
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Option 1: Development Mode (Recommended for testing)

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Then open http://localhost:3000 in your browser.

### Option 2: Production Mode

Build and run everything from one process:

```bash
cd frontend
npm run build
cd ..
npm start
```

Then open http://localhost:3001 in your browser.

## Testing

Try searching for these example components:
- LM358
- 1N4148W-TP
- 74HC595
- ATmega328P

## Notes

- The Excel file (Components.xlsx) will be created automatically after the first search
- Check the browser console for any errors
- Check the server terminal for backend errors
