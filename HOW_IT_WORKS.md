# 🔍 How the Data Fetching Works

## 📍 Data Source: FindChips.com

All component data comes from **https://www.findchips.com/** - a component search engine that aggregates inventory from multiple distributors.

---

## 🔄 Step-by-Step Process

### Step 1: User Enters Part Number
```
User types: "LM358"
```

### Step 2: Frontend Sends Request
```javascript
// Frontend sends this:
POST http://localhost:3001/api/search
Body: { "partNumber": "LM358" }
```

### Step 3: Backend Constructs FindChips URL
```javascript
// In server.js line 96:
const searchUrl = `https://www.findchips.com/search/LM358`;
```

### Step 4: Backend Fetches HTML from FindChips
```javascript
const response = await axios.get(searchUrl, {
    headers: {
        'User-Agent': 'Mozilla/5.0...' // Pretends to be a browser
    }
});
```

### Step 5: Parse the HTML to Extract Data
```javascript
const $ = cheerio.load(response.data);

// Extract description
const description = $('.product-description').text();

// Extract price  
const price = $('.price').text();

// Extract distributor
const distributor = $('.distributor').text();
```

### Step 6: Save to Excel File
```javascript
// Save all data to Components.xlsx
saveComponentsToExcel(components);
```

### Step 7: Send Data Back to Frontend
```javascript
res.json({
    success: true,
    data: {
        partNumber: "LM358",
        description: "Dual Operational Amplifier",
        price: "$0.50",
        distributor: "Digi-Key",
        ...
    }
});
```

---

## 📊 Real Example Flow

### When you search "LM358":

1. **Browser** → Your website: `localhost:3000`
2. **Your Website** → Your Backend: `localhost:3001/api/search`
3. **Your Backend** → FindChips: `https://www.findchips.com/search/LM358`
4. **FindChips** → Returns HTML page with component data
5. **Your Backend** → Parses HTML and extracts:
   ```
   Part Number: LM358
   Description: Dual Operational Amplifier
   Manufacturer: Texas Instruments
   Price: $0.50
   Distributor: Digi-Key
   Stock: 10,000+
   ```
6. **Your Backend** → Saves to `Components.xlsx`
7. **Your Backend** → Sends data to your website
8. **Your Website** → Displays in table

---

## 🛠️ Technical Details

### Technologies Used:

1. **Axios** - Fetches HTML from FindChips
   ```javascript
   axios.get('https://www.findchips.com/search/LM358')
   ```

2. **Cheerio** - Parses HTML like jQuery
   ```javascript
   const $ = cheerio.load(html);
   const price = $('.price').text();
   ```

3. **XLSX** - Creates/updates Excel file
   ```javascript
   XLSX.writeFile(workbook, 'Components.xlsx');
   ```

---

## 🌐 Website Structure Mapping

### FindChips.com Page Structure:
```html
<div class="product">
    <h1 class="product-description">LM358</h1>
    <span class="manufacturer">Texas Instruments</span>
    <span class="price">$0.50</span>
    <span class="distributor">Digi-Key</span>
    <a href="datasheet.pdf">View Datasheet</a>
</div>
```

### Our Parser Extracts:
```javascript
description = $('.product-description').text();    // "LM358"
manufacturer = $('.manufacturer').text();          // "Texas Instruments"
price = $('.price').text();                        // "$0.50"
distributor = $('.distributor').text();            // "Digi-Key"
```

---

## ⚡ Why It Works

1. **FindChips is Public** - Anyone can access it
2. **Standard HTTP** - We just request the page like a browser
3. **HTML Structure** - We parse the visible elements
4. **No API Needed** - We scrape the public website

---

## 🔒 Important Notes

### Why Rate Limiting?
```javascript
// We limit to 30 requests/minute
const REQUESTS_PER_MINUTE = 30;
```
- **Respect**: Don't overload FindChips server
- **Legal**: Stay within fair use
- **Reliability**: Avoid getting blocked

### Is This Legal?
✅ **YES** - We're:
- Accessing public data
- Using normal HTTP requests
- Not bypassing any security
- Following their robots.txt
- Using reasonable rate limits

---

## 📝 Summary

**Data Flow:**
```
You → Your Website → Your Backend → FindChips.com
                                                ↓
                                      (HTML with component data)
                                                ↓
Your Backend ← Parses HTML ← FindChips.com
       ↓
Saves to Excel & Returns Data
       ↓
Your Website Displays Data
```

**Key Point:** We're not using a special API or database. We're simply:
1. Opening FindChips.com in your browser (programmatically)
2. Reading what's on the page
3. Extracting the useful information
4. Saving it to Excel

Just like you would manually copy-paste from the website, but automated! 🤖
