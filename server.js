// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

let tesseract;
try {
    tesseract = require('tesseract.js');
} catch (error) {
    console.warn('⚠️ Tesseract.js not installed. OCR functionality will be limited. Install with: npm install tesseract.js');
    tesseract = null;
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
// CORS configuration - allow both development and production origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://semiconventures.in',
    'http://semiconventures.in',
    'https://www.semiconventures.in',
    'http://www.semiconventures.in'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'semicon-ventures-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: NODE_ENV === 'production', // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize user session if not exists
app.use((req, res, next) => {
    if (!req.session.userId) {
        req.session.userId = uuidv4();
        console.log(`🆕 New user session created: ${req.session.userId}`);
    }
    next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload an image (JPG, PNG, GIF) or text file (TXT).'));
        }
    }
});

// Get user-specific Excel file path
function getUserExcelFile(userId) {
    // Create user-data directory if it doesn't exist
    const userDataDir = path.join(__dirname, 'user-data');
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }
    return path.join(userDataDir, `Components_${userId}.xlsx`);
}

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds minimum between requests
const REQUESTS_PER_MINUTE = 30;
const requestTimestamps = [];

// DEBUG: Save HTML for inspection
function saveHtmlForDebug(html, partNumber) {
    try {
        const debugDir = path.join(__dirname, 'debug-html');
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir);
        }
        const filename = path.join(debugDir, `${partNumber}-${Date.now()}.html`);
        fs.writeFileSync(filename, html);
        console.log(`💾 HTML saved for debugging: ${filename}`);
    } catch (error) {
        console.error('Error saving debug HTML:', error.message);
    }
}

// Load existing components from Excel for a specific user
function loadComponentsFromExcel(userId) {
    const excelFile = getUserExcelFile(userId);
    
    if (!fs.existsSync(excelFile)) {
        return [];
    }
    
    try {
        const workbook = XLSX.readFile(excelFile);
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            console.error('Excel file is empty or invalid');
            return [];
        }
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
            console.error('Worksheet not found');
            return [];
        }
        const data = XLSX.utils.sheet_to_json(worksheet);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error reading Excel file:', error.message);
        // If file is corrupted, rename it and return empty array
        try {
            const backupName = `${excelFile}.backup.${Date.now()}`;
            fs.renameSync(excelFile, backupName);
            console.log(`Corrupted Excel file renamed to: ${backupName}`);
        } catch (renameError) {
            console.error('Could not rename corrupted file:', renameError.message);
        }
        return [];
    }
}

// Save components to Excel for a specific user
function saveComponentsToExcel(components, userId) {
    try {
        const excelFile = getUserExcelFile(userId);
        const worksheet = XLSX.utils.json_to_sheet(components);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Components');
        XLSX.writeFile(workbook, excelFile);
        return true;
    } catch (error) {
        console.error('Error saving to Excel:', error.message);
        return false;
    }
}

// Rate limiting check
function checkRateLimit() {
    const now = Date.now();
    
    // Remove timestamps older than 1 minute
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
        requestTimestamps.shift();
    }
    
    // Check if we've exceeded the limit
    if (requestTimestamps.length >= REQUESTS_PER_MINUTE) {
        return false;
    }
    
    // Check minimum interval
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
        return false;
    }
    
    lastRequestTime = now;
    requestTimestamps.push(now);
    return true;
}

// Get random delay for stealth
function getRandomDelay() {
    return Math.floor(Math.random() * 1000) + 500; // 500-1500ms
}

// Enhanced part number validation - more accurate patterns
function isValidPartNumber(part) {
    if (!part || typeof part !== 'string') return false;
    
    const trimmed = part.trim().toUpperCase();
    
    // Basic length check
    if (trimmed.length < 3 || trimmed.length > 40) return false;
    
    // Must contain both letters and numbers (typical for part numbers)
    if (!/[A-Z]/.test(trimmed) || !/[0-9]/.test(trimmed)) return false;
    
    // Exclude common false positives
    const excludePatterns = [
        /^\d{4}$/,                    // Years (2024, 2025, etc.)
        /^\d{1,3}$/,                  // Pure numbers (1-999)
        /^[A-Z]{1,3}$/,               // Abbreviations (API, URL, etc.)
        /^[A-Z]{1,2}\d{1,2}$/,        // Short codes (A1, B2, etc.)
        /^\d{4}-\d{2}-\d{2}$/,        // Dates (2024-01-01)
        /^[A-Z]\d{4}[A-Z]?$/,         // Serial numbers (A1234B)
        /^REF\d+$/i,                  // References (REF123)
        /^ITEM\d+$/i,                 // Items (ITEM123)
        /^PART\d+$/i,                 // Parts (PART123)
        /^[A-Z]{2}\d{6}$/,            // Date codes (AB123456)
        /^\d{6,8}$/,                  // Large numbers (123456)
        /^[A-Z]{2,4}$/,               // Common abbreviations (SW1, D1, C6, etc.)
        /CUSTOMER/i,                  // Exclude "CUSTOMER" (description, not part number)
        /MICROCONTROLLER/i,           // Exclude "MICROCONTROLLER" (description)
        /BIT.*CONTROLLER/i,           // Exclude "BIT CONTROLLER" patterns (descriptions)
        /^[A-Z]{10,}\d/i,             // Very long prefixes (likely descriptions)
        /(CONNECTOR|RESISTOR|CAPACITOR|DIODE|TRANSISTOR)[A-Z]*\d/i,  // Common component descriptions
        /^[A-Z]+\d+\-[A-Z]+\d+$/i,    // Range patterns (SW17-SW19, D1-D11, C1-C10, etc.)
        /^[A-Z]+\d+\-\d+$/i,          // Range patterns with same prefix (SW1-SW19, D1-D11, etc.)
        /^[A-Z]+\-\d+$/i              // Partial ranges (SW-SW19, D-D11, etc.)
    ];
    
    // Check exclusion patterns
    if (excludePatterns.some(pattern => pattern.test(trimmed))) return false;
    
    // Better part number patterns - more specific
    const validPatterns = [
        /^[A-Z]{2,8}\d{2,8}[A-Z]?(\-[A-Z0-9]+)*$/,      // LM358, LM358ADT, NE555P
        /^[A-Z]\d{1,2}[A-Z]{1,4}\d{1,6}(\-[A-Z0-9]+)*$/, // 1N4148, 2N3904, 3N4148
        /^[A-Z]{2,6}\d{4,6}[A-Z]?(\-[A-Z0-9]+)*$/,      // SN74HC595, ATmega328P
        /^[A-Z]{2,6}\d{2,6}(\/[A-Z0-9]+)*$/,            // LM358/NOPB
        /^[A-Z]{2,6}\d{2,6}(\.[A-Z0-9]+)*$/,            // LM358.DT
        /^[A-Z]{3,8}\d{2,6}[A-Z]{0,4}(\-?\d+)?$/        // ESP32-WROOM-32, STM32F103C8T6
    ];
    
    // Must match at least one valid pattern
    const matchesValidPattern = validPatterns.some(pattern => pattern.test(trimmed));
    
    if (!matchesValidPattern) return false;
    
    // Additional validation - check for common part number prefixes
    const commonPrefixes = [
        'LM', 'NE', 'SN', 'TL', 'UA', 'MC', 'IC', 'CD', 'HC', 'LS',
        '1N', '2N', '3N', 'BC', '2N', 'PN', 'TIP',
        'AT', 'AVR', 'PIC', 'ESP', 'STM',
        'IRF', 'MPS', 'TIP', 'BD', 'IR',
        'MAX', 'INA', 'OPA', 'TL', 'LM'
    ];
    
    // Check if it starts with common prefix (optional but preferred)
    const hasCommonPrefix = commonPrefixes.some(prefix => 
        trimmed.toUpperCase().startsWith(prefix.toUpperCase())
    );
    
    // If it doesn't have a common prefix, be more strict
    if (!hasCommonPrefix) {
        // Must have at least 2 letters followed by at least 2 numbers
        if (!/^[A-Z]{2,}\d{2,}/.test(trimmed)) return false;
    }
    
    return true;
}

// Extract part numbers from text file with improved parsing
function extractPartNumbersFromText(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Clean up content - remove common OCR errors
        content = content
            .replace(/[|]/g, 'I')      // Replace | with I
            .replace(/[Il1]/g, '1')    // Common OCR mistakes
            .replace(/[O0]/g, '0')     // O and 0 confusion
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .replace(/[^\w\s\-.\/]/g, ' '); // Remove special chars except - . /
        
        // Multiple extraction strategies
        const partNumbers = new Set();
        
        // Strategy 1: Line-by-line extraction (more accurate)
        const lines = content.split(/\n|\r/);
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Split by spaces, commas, tabs, etc.
            const tokens = line.split(/[\s,\t;:]+/);
            tokens.forEach(token => {
                token = token.trim().toUpperCase();
                // Remove common prefixes/suffixes that aren't part of part number
                token = token.replace(/^(REF|ITEM|PART|ID|NO|#|NUM)[:\s]*/i, '');
                token = token.replace(/[:\s]*(REF|ITEM|PART|ID|NO|#|NUM)$/i, '');
                
                if (isValidPartNumber(token)) {
                    partNumbers.add(token);
                }
            });
        });
        
        // Strategy 2: Pattern matching on full text
        const patterns = [
            /\b([A-Z]{2,8}\d{2,8}[A-Z]?(\-[A-Z0-9]+)*)\b/g,      // LM358, LM358ADT
            /\b([A-Z]\d{1,2}[A-Z]{1,4}\d{1,6}(\-[A-Z0-9]+)*)\b/g, // 1N4148
            /\b([A-Z]{2,6}\d{4,6}[A-Z]?(\-[A-Z0-9]+)*)\b/g       // SN74HC595
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const part = match[1].trim().toUpperCase();
                if (isValidPartNumber(part)) {
                    partNumbers.add(part);
                }
            }
        });
        
        // Convert Set to Array and return
        const result = Array.from(partNumbers);
        console.log(`📄 Extracted ${result.length} part numbers from text file:`, result);
        return result;
        
    } catch (error) {
        console.error('Error reading text file:', error.message);
        return [];
    }
}

// Extract part numbers from image using OCR with improved accuracy
async function extractPartNumbersFromImage(imagePath) {
    try {
        if (!tesseract) {
            throw new Error('Tesseract.js is not installed. Please install it with: npm install tesseract.js');
        }
        
        console.log(`🔍 Starting OCR for image: ${imagePath}`);
        
        // Create worker with multiple languages for better accuracy
        const worker = await tesseract.createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`   Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });
        
        // Set OCR parameters for better accuracy with alphanumeric text
        await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-/_',
            tessedit_pageseg_mode: '6', // Assume uniform block of text
            preserve_interword_spaces: '1'
        });
        
        // Perform OCR with better settings
        const { data: { text } } = await worker.recognize(imagePath, {
            rectangle: undefined // Process entire image
        });
        
        await worker.terminate();
        
        console.log(`📝 OCR extracted text: ${text.substring(0, 200)}...`);
        
        // Clean up OCR text - fix common OCR mistakes
        let cleanedText = text
            .replace(/[|]/g, 'I')           // | often misread as I
            .replace(/[Il1](?=\d)/g, '1')   // I or l before numbers = 1
            .replace(/(?<=\d)[Il]/g, '1')   // I or l after numbers = 1
            .replace(/[O0](?=[A-Z])/g, '0') // O before letters = 0
            .replace(/(?<=[A-Z])[O0]/g, 'O') // O after letters = O
            .replace(/[Ss5]/g, 'S')         // Common confusion
            .replace(/\s+/g, ' ')           // Normalize whitespace
            .replace(/[^\w\s\-.\/]/g, ' '); // Remove special chars
        
        // Multiple extraction strategies
        const partNumbers = new Set();
        
        // Strategy 1: Line-by-line extraction (most accurate for structured data)
        const lines = cleanedText.split(/\n|\r/);
        lines.forEach((line, lineIndex) => {
            line = line.trim();
            if (!line || line.length < 3) return;
            
            // Split by spaces, commas, tabs, etc.
            const tokens = line.split(/[\s,\t;:]+/);
            tokens.forEach(token => {
                token = token.trim().toUpperCase();
                // Remove common prefixes/suffixes
                token = token.replace(/^(REF|ITEM|PART|ID|NO|#|NUM)[:\s]*/i, '');
                token = token.replace(/[:\s]*(REF|ITEM|PART|ID|NO|#|NUM)$/i, '');
                
                if (isValidPartNumber(token)) {
                    partNumbers.add(token);
                }
            });
        });
        
        // Strategy 2: Pattern matching on full text
        const patterns = [
            /\b([A-Z]{2,8}\d{2,8}[A-Z]?(\-[A-Z0-9]+)*)\b/g,      // LM358, LM358ADT
            /\b([A-Z]\d{1,2}[A-Z]{1,4}\d{1,6}(\-[A-Z0-9]+)*)\b/g, // 1N4148
            /\b([A-Z]{2,6}\d{4,6}[A-Z]?(\-[A-Z0-9]+)*)\b/g       // SN74HC595
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(cleanedText)) !== null) {
                const part = match[1].trim().toUpperCase();
                if (isValidPartNumber(part)) {
                    partNumbers.add(part);
                }
            }
        });
        
        // Strategy 3: Look for part numbers in all caps followed by numbers
        const allCapsPattern = /\b([A-Z]{2,8}\d{2,8}[A-Z0-9\-]*)\b/g;
        let match;
        while ((match = allCapsPattern.exec(cleanedText)) !== null) {
            const part = match[1].trim().toUpperCase();
            if (isValidPartNumber(part)) {
                partNumbers.add(part);
            }
        }
        
        // Convert Set to Array and return
        const result = Array.from(partNumbers);
        console.log(`✅ OCR extracted ${result.length} valid part numbers:`, result);
        
        if (result.length === 0) {
            console.warn('⚠️ No valid part numbers found in OCR text');
            console.log('📄 Full OCR text:', cleanedText);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error processing image with OCR:', error.message);
        throw error;
    }
}

// Get random user agent to avoid detection
function getRandomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Search FindChips for component
async function searchFindChips(partNumber) {
    if (!checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
    }
    
    try {
        // Add random delay to avoid detection (longer delay for production)
        const delay = process.env.NODE_ENV === 'production' ? 
            Math.floor(Math.random() * 2000) + 2000 : // 2-4 seconds in production
            getRandomDelay(); // 0.5-1.5 seconds in development
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const searchUrl = `https://www.findchips.com/search/${encodeURIComponent(partNumber)}`;
        
        // Use more realistic headers to avoid detection
        const headers = {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.findchips.com/',
            'DNT': '1'
        };
        
        const response = await axios.get(searchUrl, {
            headers: headers,
            timeout: 15000, // Increased timeout
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Accept redirects
            }
        });
        
        // Check if response is blocked or empty
        if (!response.data || response.data.length < 1000) {
            console.error('❌ Response too short or empty - likely blocked');
            throw new Error('FindChips returned an empty or blocked response. The server IP may be blocked. Please try again later.');
        }
        
        const $ = cheerio.load(response.data);
        
        // Save HTML for debugging (first time only)
        saveHtmlForDebug(response.data, partNumber);
        
        // Check if FindChips blocked the request
        const pageTitle = $('title').text().toLowerCase();
        const pageText = $('body').text().toLowerCase();
        const pageHtml = response.data.toLowerCase();
        
        // Check for blocking indicators
        if (pageTitle.includes('access denied') ||
            pageTitle.includes('blocked') ||
            pageTitle.includes('forbidden') ||
            pageText.includes('access denied') ||
            pageText.includes('your request has been blocked') ||
            pageText.includes('cloudflare') ||
            pageText.includes('checking your browser') ||
            pageHtml.includes('cf-browser-verification') ||
            pageHtml.includes('challenge-platform') ||
            pageHtml.includes('just a moment')) {
            console.error('❌ FindChips blocked the request - Cloudflare or anti-bot protection');
            throw new Error('FindChips is blocking automated requests from this server. This is a temporary limitation. Please try again in a few minutes or contact support.');
        }
        
        // Check for error indicators
        if (pageTitle.includes('error') || 
            pageTitle.includes('not found') || 
            pageTitle.includes('404') ||
            pageText.includes('no results found') ||
            pageText.includes('no parts found') ||
            pageText.includes('part not found') ||
            pageText.includes('we couldn\'t find')) {
            throw new Error(`Part number "${partNumber}" not found on FindChips. Please verify the part number and try again.`);
        }
        
        // Parse the page to extract component data
        const componentData = {
            partNumber: partNumber,
            manufacturer: '',
            description: '',
            lowestPrice: '',
            availableStock: '',
            distributor: '',
            datasheetLink: '',
            searchUrl: searchUrl
        };
        
        console.log('\n========================================');
        console.log('🔍 Parsing FindChips page for:', partNumber);
        console.log('📄 Page title:', $('title').text());
        console.log('========================================\n');
        
        // EXTRACT DESCRIPTION - Match FindChips format
        console.log('🔍 Extracting description and other data...');
        
        // Try to extract from table rows (typical FindChips structure)
        $('table tbody tr, .result-row, .part-row').each((i, elem) => {
            if (i === 0) { // First row only
                const $row = $(elem);
                
                // Get manufacturer from first row
                if (!componentData.manufacturer) {
                    const mfg = $row.find('td:nth-child(2), .manufacturer').first().text().trim();
                    if (mfg && mfg.length > 2) {
                        componentData.manufacturer = mfg;
                        console.log('✓ Found manufacturer:', mfg);
                    }
                }
                
                // Get description (usually in 3rd column)
                if (!componentData.description) {
                    let desc = $row.find('td:nth-child(3), .description').first().text().trim();
                    // Clean description - remove extra info
                    desc = desc.replace(/(Prices include|COO:|RoHS:|Min Qty:|Container:).*/gi, '').trim();
                    if (desc && desc.length > 10) {
                        componentData.description = desc;
                        console.log('✓ Found description:', desc);
                    }
                }
                
            }
        });
        
        // Fallback: Try to find text patterns in the page
        if (!componentData.description) {
            $('body').text().split(/\n/).forEach(line => {
                const trimmed = line.trim();
                
                // Look for technical descriptions like "OP-AMP, 1.1MHZ, 0.6V/US, DFN-8"
                if (trimmed && trimmed.length > 20 && trimmed.length < 150 &&
                    !trimmed.includes('₹') && !trimmed.includes('$') &&
                    /[A-Z][A-Z0-9\s,]+,.*[0-9]/.test(trimmed)) {
                    if (!componentData.description) {
                        componentData.description = trimmed;
                        console.log('✓ Found description (fallback):', trimmed);
                    }
                }
            });
        }
        
        // Final fallback
        if (!componentData.description) {
            componentData.description = `${partNumber} Component`;
        }
        
        // EXTRACT PRICING AND DISTRIBUTOR - From data attributes (FindChips format)
        console.log('🔍 Searching for pricing and distributor information...');
        
        const priceTiers = [];
        let foundDistributor = false;
        
        // Extract pricing, distributor, and stock from data attributes in table rows
        $('tr[data-price]').each((i, elem) => {
            if (i === 0) { // First row only
                const priceData = $(elem).attr('data-price');
                const distributorName = $(elem).attr('data-distributor_name');
                const stockData = $(elem).attr('data-instock');
                
                // Extract distributor
                if (!foundDistributor && distributorName) {
                    componentData.distributor = distributorName;
                    console.log('✓ Found distributor:', distributorName);
                    foundDistributor = true;
                }
                
                // Extract available stock
                if (stockData && !componentData.availableStock) {
                    componentData.availableStock = stockData;
                    console.log('✓ Found stock data:', stockData);
                }
                
                // Extract pricing
                if (priceData) {
                    try {
                        // Decode HTML entities and parse JSON
                        const decodedPrice = priceData.replace(/&#34;/g, '"');
                        const priceArray = JSON.parse(decodedPrice);
                        
                        // Convert to readable format
                        priceArray.forEach(tier => {
                            const [qty, currency, price] = tier;
                            const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
                            priceTiers.push({ qty: qty, price: `${currencySymbol}${price}` });
                        });
                        
                        console.log('✓ Found pricing data:', priceArray);
                    } catch (error) {
                        console.log('⚠️ Error parsing price data:', error.message);
                    }
                }
            }
        });
        
        // If distributor not found in table rows, try from distributor-results div
        if (!foundDistributor) {
            const distributorDiv = $('.distributor-results').first();
            if (distributorDiv.length) {
                const distName = distributorDiv.attr('data-distributor_name');
                if (distName) {
                    componentData.distributor = distName;
                    console.log('✓ Found distributor from div:', distName);
                    foundDistributor = true;
                }
            }
        }
        
        // Format like FindChips: "5 ₹40.0600, 10 ₹24.8400, 100 ₹19.0100"
        if (priceTiers.length > 0) {
            componentData.lowestPrice = priceTiers
                .slice(0, 7) // Show max 7 price tiers
                .map(tier => `${tier.qty} ${tier.price}`)
                .join(', ');
            console.log('✓ Found pricing tiers:', componentData.lowestPrice);
        } else {
            // Fallback: Try to find any price in text
            const singlePrice = response.data.match(/(₹|\$)([\d,]+\.?\d*)/);
            if (singlePrice) {
                componentData.lowestPrice = singlePrice[0];
                console.log('✓ Found single price:', componentData.lowestPrice);
            }
        }
        
        if (!componentData.lowestPrice) {
            console.log('⚠️ No price found');
            componentData.lowestPrice = 'N/A';
        }
        
        if (!foundDistributor) {
            console.log('⚠️ No distributor found');
            componentData.distributor = 'N/A';
        }
        
        if (!componentData.availableStock) {
            console.log('⚠️ No stock data found');
            componentData.availableStock = 'N/A';
        }
        
        // Try to find datasheet link
        const datasheetLink = $('a[href*="datasheet"], a[href*="Part Details"]').first().attr('href');
        if (datasheetLink) {
            componentData.datasheetLink = datasheetLink.startsWith('http') ? datasheetLink : `https://www.findchips.com${datasheetLink}`;
        }
        
        console.log('\n========================================');
        console.log('✅ EXTRACTION COMPLETE');
        console.log('========================================');
        console.log('Part Number   :', componentData.partNumber);
        console.log('Description   :', componentData.description);
        console.log('Price         :', componentData.lowestPrice);
        console.log('Available Stock:', componentData.availableStock || 'N/A');
        console.log('Manufacturer  :', componentData.manufacturer || 'N/A');
        console.log('Distributor   :', componentData.distributor || 'N/A');
        console.log('========================================\n');
        
        // Validate that we extracted at least some data
        const hasValidData = (
            (componentData.description && componentData.description !== `${partNumber} Component` && componentData.description.length > 10) ||
            (componentData.lowestPrice && componentData.lowestPrice !== 'N/A') ||
            (componentData.distributor && componentData.distributor !== 'N/A') ||
            (componentData.manufacturer && componentData.manufacturer.length > 2) ||
            (componentData.availableStock && componentData.availableStock !== 'N/A')
        );
        
        if (!hasValidData) {
            console.error(`❌ No valid data extracted for part number: ${partNumber}`);
            throw new Error(`No data found for part number "${partNumber}". The part may not exist on FindChips or may be unavailable. Please verify the part number and try again.`);
        }
        
        return componentData;
        
    } catch (error) {
        console.error('❌ Error searching FindChips:', error.message);
        console.error('❌ Error details:', {
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
        });
        
        // Handle specific error cases
        if (error.response) {
            if (error.response.status === 403) {
                throw new Error('FindChips is blocking automated requests from this server. This is a temporary limitation. Please try again in a few minutes.');
            } else if (error.response.status === 429) {
                throw new Error('Too many requests to FindChips. Please wait 1-2 minutes and try again.');
            } else if (error.response.status === 503 || error.response.status === 502) {
                throw new Error('FindChips service is temporarily unavailable. Please try again in a few minutes.');
            } else if (error.response.status >= 500) {
                throw new Error('FindChips server error. Please try again later.');
            } else if (error.response.status === 404) {
                throw new Error(`Part number "${partNumber}" not found on FindChips. Please verify the part number and try again.`);
            }
        }
        
        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new Error('Request to FindChips timed out. The server may be slow or blocking requests. Please try again in a few minutes.');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to FindChips. Please check your internet connection and try again.');
        }
        
        // If error message already contains useful info, use it
        if (error.message && (
            error.message.includes('blocked') ||
            error.message.includes('empty') ||
            error.message.includes('not found') ||
            error.message.includes('Cloudflare')
        )) {
            throw error; // Re-throw with original message
        }
        
        // Generic error
        throw new Error(`Failed to search component "${partNumber}": ${error.message}. This may be due to FindChips blocking automated requests. Please try again in a few minutes.`);
    }
}

// Use the improved isValidPartNumber function for all validation

// API endpoint to search for a component
app.post('/api/search', async (req, res) => {
    try {
        const userId = req.session.userId;
        const { partNumber } = req.body;
        
        if (!partNumber || partNumber.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Part number is required' 
            });
        }
        
        const trimmedPartNumber = partNumber.trim();
        
        // Validate part number
        if (!isValidPartNumber(trimmedPartNumber)) {
            return res.status(400).json({ 
                success: false,
                error: `"${trimmedPartNumber}" is not a valid part number. Please enter a valid part number (e.g., LM358, 1N4148, NE555, SN74HC595).` 
            });
        }
        
        // Load existing components for this user
        let components = loadComponentsFromExcel(userId);
        
        // Check if component already exists
        const existingIndex = components.findIndex(c => 
            c.partNumber && c.partNumber.toLowerCase() === trimmedPartNumber.toLowerCase()
        );
        
        console.log(`\n🔍 Searching for part number: ${trimmedPartNumber}`);
        
        // Search FindChips
        let componentData;
        try {
            componentData = await searchFindChips(trimmedPartNumber);
        } catch (searchError) {
            console.error(`❌ Error searching FindChips for ${trimmedPartNumber}:`, searchError.message);
            
            // Determine if this is a validation error (400) or server error (500)
            const errorMessage = searchError.message || '';
            const isValidationError = (
                errorMessage.includes('not found') ||
                errorMessage.includes('not a valid part number') ||
                errorMessage.includes('No data found') ||
                errorMessage.includes('not exist') ||
                errorMessage.includes('unavailable')
            );
            
            const statusCode = isValidationError ? 404 : 500;
            return res.status(statusCode).json({
                success: false,
                error: `Failed to search for "${trimmedPartNumber}": ${searchError.message}. Please check if the part number is correct and try again.`
            });
        }
        
        // Validate that we got actual data (not just empty fields)
        if (!componentData || (!componentData.description || componentData.description === `${trimmedPartNumber} Component`)) {
            // Check if we have at least price or distributor data
            const hasData = componentData && (
                (componentData.lowestPrice && componentData.lowestPrice !== 'N/A') ||
                (componentData.distributor && componentData.distributor !== 'N/A') ||
                (componentData.manufacturer && componentData.manufacturer !== '')
            );
            
            if (!hasData) {
                console.error(`⚠️ No data found for part number: ${trimmedPartNumber}`);
                return res.status(404).json({
                    success: false,
                    error: `No data found for part number "${trimmedPartNumber}". The part may not exist on FindChips or may be unavailable. Please verify the part number and try again.`
                });
            }
        }
        
        // Update or add component
        if (existingIndex >= 0) {
            components[existingIndex] = { ...components[existingIndex], ...componentData };
            console.log(`✅ Component updated: ${trimmedPartNumber}`);
        } else {
            components.push(componentData);
            console.log(`✅ Component added: ${trimmedPartNumber}`);
        }
        
        // Save to Excel for this user
        try {
            const saved = saveComponentsToExcel(components, userId);
        if (!saved) {
                console.error('⚠️ Failed to save to Excel file');
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save component to Excel file. Please try again.'
                });
            }
        } catch (saveError) {
            console.error('❌ Error saving to Excel:', saveError.message);
            return res.status(500).json({
                success: false,
                error: `Failed to save component: ${saveError.message}`
            });
        }
        
        res.json({
            success: true,
            data: componentData,
            message: existingIndex >= 0 ? 'Component updated successfully!' : 'Component added successfully!'
        });
        
    } catch (error) {
        console.error('❌ Search error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: `An unexpected error occurred: ${error.message}. Please try again.`
        });
    }
});

// API endpoint to get all components
app.get('/api/components', (req, res) => {
    try {
        const userId = req.session.userId;
        const components = loadComponentsFromExcel(userId);
        res.json({ success: true, data: components || [] });
    } catch (error) {
        console.error('Error in /api/components:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to load components',
            data: [] 
        });
    }
});

// API endpoint to clear all components
app.delete('/api/components', (req, res) => {
    try {
        const userId = req.session.userId;
        const excelFile = getUserExcelFile(userId);
        
        // Delete the Excel file for this user
        if (fs.existsSync(excelFile)) {
            try {
                fs.unlinkSync(excelFile);
                console.log(`Excel file deleted successfully for user: ${userId}`);
            } catch (unlinkError) {
                // If file is locked, rename it instead
                const backupName = `${excelFile}.backup.${Date.now()}`;
                fs.renameSync(excelFile, backupName);
                console.log(`Excel file renamed to backup: ${backupName}`);
            }
        }
        
        res.json({ success: true, message: 'All components cleared successfully' });
    } catch (error) {
        console.error('Error in /api/components DELETE:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to clear components' 
        });
    }
});

// API endpoint to export Excel file
app.get('/api/export', (req, res) => {
    try {
        const userId = req.session.userId;
        const excelFile = getUserExcelFile(userId);
        
        if (!fs.existsSync(excelFile)) {
            return res.status(404).json({ success: false, error: 'No components found. Please search for components first.' });
        }
        
        res.download(excelFile, 'Components.xlsx', (err) => {
            if (err) {
                console.error('Error downloading Excel file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, error: 'Failed to export Excel file' });
                }
    }
});
    } catch (error) {
        console.error('Error in /api/export:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to export Excel file' });
    }
});

// Export a single part number to Excel
app.get('/api/export/:partNumber', (req, res) => {
    try {
        const userId = req.session.userId;
        // Decode URL parameter (handles special characters and encoding)
        const partNumber = decodeURIComponent(req.params.partNumber);
        
        if (!partNumber || partNumber.trim() === '') {
            return res.status(400).json({ success: false, error: 'Part number is required' });
        }
        
        const excelFile = getUserExcelFile(userId);
        if (!fs.existsSync(excelFile)) {
            return res.status(404).json({ success: false, error: 'No components found to export' });
        }

        // Load existing components for this user
        let components = [];
        try {
            const workbook = XLSX.readFile(excelFile);
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                return res.status(404).json({ success: false, error: 'No components found to export' });
            }
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                return res.status(404).json({ success: false, error: 'No components found to export' });
            }
            components = XLSX.utils.sheet_to_json(worksheet) || [];
        } catch (e) {
            console.error('Error reading Excel for single export:', e.message);
            return res.status(500).json({ success: false, error: 'Failed to read data for export' });
        }

        // Filter by part number (case-insensitive, handle missing partNumber field)
        const partNumberLower = partNumber.trim().toLowerCase();
        const filtered = components.filter(c => {
            const compPartNumber = (c.partNumber || '').toString().trim().toLowerCase();
            return compPartNumber === partNumberLower;
        });
        
        if (filtered.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: `No records found for part number: ${partNumber}` 
            });
        }

        // Build a workbook with only the selected part
        try {
            const worksheet = XLSX.utils.json_to_sheet(filtered);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, worksheet, 'Component');

            // Create temporary directory if it doesn't exist
            const tmpDir = path.join(__dirname, 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }
            
            // Sanitize filename (remove invalid characters)
            const safeFileName = partNumber.trim().replace(/[<>:"/\\|?*]/g, '_');
            const tmpFile = path.join(tmpDir, `${safeFileName}-${Date.now()}.xlsx`);
            XLSX.writeFile(wb, tmpFile);

            // Send file and cleanup after download
            res.download(tmpFile, `${safeFileName}.xlsx`, (err) => {
                if (err) {
                    console.error('Error sending single export file:', err.message);
                    if (!res.headersSent) {
                        res.status(500).json({ success: false, error: 'Failed to download file' });
                    }
                }
                // Cleanup temp file after a short delay
                setTimeout(() => {
                    try {
                        if (fs.existsSync(tmpFile)) {
                            fs.unlinkSync(tmpFile);
                        }
                    } catch (cleanupError) {
                        console.error('Error cleaning up temp file:', cleanupError.message);
                    }
                }, 1000);
            });
        } catch (e) {
            console.error('Error generating single export workbook:', e.message);
            return res.status(500).json({ success: false, error: 'Failed to generate export file' });
        }
    } catch (error) {
        console.error('Error in /api/export/:partNumber:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to export component' 
        });
    }
});

// API endpoint to upload and process file/image
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        let partNumbers = [];
        
        console.log(`\n📁 Processing uploaded file: ${req.file.originalname}`);
        console.log(`📄 File type: ${fileType}`);
        
        // Process based on file type
        if (fileType.startsWith('image/')) {
            // Process image with OCR
            console.log('🔍 Extracting text from image using OCR...');
            partNumbers = await extractPartNumbersFromImage(filePath);
        } else if (fileType === 'text/plain' || req.file.originalname.endsWith('.txt')) {
            // Process text file
            console.log('📝 Extracting part numbers from text file...');
            partNumbers = extractPartNumbersFromText(filePath);
        } else {
            // Try OCR for PDF or unknown types
            console.log('🔍 Attempting OCR extraction...');
            partNumbers = await extractPartNumbersFromImage(filePath);
        }
        
        // Clean up uploaded file
        try {
            fs.unlinkSync(filePath);
        } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError.message);
        }
        
        if (partNumbers.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No part numbers found in the uploaded file. Please ensure the image or file contains readable part numbers.' 
            });
        }
        
        console.log(`✅ Found ${partNumbers.length} part number(s):`, partNumbers);
        
        res.json({
            success: true,
            partNumbers: partNumbers,
            message: `Found ${partNumbers.length} part number(s)`
        });
        
    } catch (error) {
        console.error('Error in /api/upload:', error);
        
        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
        }
        
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to process uploaded file' 
        });
    }
});

// Diagnostic endpoint to test FindChips connectivity
app.get('/api/test-findchips', async (req, res) => {
    try {
        const testPartNumber = 'LM358';
        const testUrl = `https://www.findchips.com/search/${encodeURIComponent(testPartNumber)}`;
        
        console.log('🔍 Testing FindChips connectivity...');
        console.log('📡 Test URL:', testUrl);
        
        const headers = {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.findchips.com/'
        };
        
        const response = await axios.get(testUrl, {
            headers: headers,
            timeout: 10000,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });
        
        const responseLength = response.data ? response.data.length : 0;
        const pageTitle = response.data ? cheerio.load(response.data)('title').text() : 'No title';
        const pageText = response.data ? cheerio.load(response.data)('body').text().toLowerCase() : '';
        
        const isBlocked = (
            responseLength < 1000 ||
            pageTitle.toLowerCase().includes('blocked') ||
            pageTitle.toLowerCase().includes('access denied') ||
            pageText.includes('cloudflare') ||
            pageText.includes('checking your browser')
        );
        
        res.json({
            success: true,
            test: {
                url: testUrl,
                status: response.status,
                responseLength: responseLength,
                pageTitle: pageTitle,
                isBlocked: isBlocked,
                canConnect: responseLength > 1000 && !isBlocked,
                message: isBlocked ? 
                    'FindChips is blocking requests from this server IP. This is why searches are not working.' :
                    'FindChips is accessible. The issue may be with specific part numbers or rate limiting.'
            }
        });
    } catch (error) {
        console.error('❌ FindChips connectivity test failed:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            test: {
                canConnect: false,
                message: 'Cannot connect to FindChips. The server IP may be blocked or there is a network issue.'
            }
        });
    }
});

// Serve static files from React app (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('FindChips component search service is ready');
});
