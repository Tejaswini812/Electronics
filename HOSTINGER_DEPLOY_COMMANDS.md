# 🚀 Hostinger VPS Deployment Commands - semiconventures.in

## ⚠️ IMPORTANT: Do NOT affect existing domains
- **Existing Domain 1:** villagecounty.in
- **Existing Domain 2:** startup-interns.in
- **New Domain:** semiconventures.in

---

## 📋 Step-by-Step Deployment Commands

### Step 1: Connect to VPS

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

**Note:** If SSH key verification is required, type `yes` when prompted.

---

### Step 2: Check Existing Projects (Verify - DO NOT MODIFY)

```bash
# Check PM2 processes
pm2 list

# Check existing directories (DO NOT MODIFY)
ls -la /var/www/

# Check Nginx configurations (DO NOT MODIFY)
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/
```

**Purpose:** Verify existing projects are running without modifying them.

---

### Step 3: Navigate to Project Directory

```bash
cd /var/www/semiconventures.in
```

---

### Step 4: Pull Latest Code from GitHub

```bash
git pull origin master
```

**Expected output:** Shows files updated from GitHub.

---

### Step 5: Verify/Create .env File

```bash
cat .env
```

**If .env file doesn't exist or doesn't have PORT=3003, create it:**
```bash
cat > .env << EOF
PORT=3003
NODE_ENV=production
EOF
```

**Verify it:**
```bash
cat .env
```

**Should show:**
```
PORT=3003
NODE_ENV=production
```

---

### Step 6: Install/Update Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 7: Rebuild Frontend

```bash
cd frontend
npm run build
cd ..
```

**Expected output:** Creates `build` folder in frontend directory.

---

### Step 8: Stop and Restart PM2 Process

```bash
# Stop the current process
pm2 stop semiconventures

# Delete the process (to restart with new code)
pm2 delete semiconventures

# Start the application with new code
pm2 start server.js --name semiconventures

# Save PM2 configuration
pm2 save

# View logs to verify it's running on port 3003
pm2 logs semiconventures
```

**Verify output shows:**
```
Server running on port 3003
FindChips component search service is ready
```

**Press `Ctrl+C` to exit logs.**

---

### Step 9: Test Server Locally

```bash
# Test if server is running on port 3003
curl http://localhost:3003

# Test API endpoint
curl http://localhost:3003/api/components
```

**Expected output:** Returns HTML (React app) and JSON (API response).

---

### Step 10: Verify Nginx Configuration

```bash
cat /etc/nginx/sites-available/semiconventures.in
```

**Should show:**
```nginx
server {
    listen 80;
    server_name semiconventures.in www.semiconventures.in;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**If it's pointing to port 3001 instead of 3003, update it:**
```bash
nano /etc/nginx/sites-available/semiconventures.in
```

**Change `proxy_pass http://localhost:3001;` to `proxy_pass http://localhost:3003;`**

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

### Step 11: Test and Reload Nginx

```bash
# Test Nginx configuration
nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If test passes, reload Nginx:**
```bash
systemctl reload nginx
```

**If test fails, check the error and fix the configuration.**

---

### Step 12: Verify DNS is Pointing to Server

```bash
# Check if domain resolves to server IP
nslookup semiconventures.in

# Or use dig
dig semiconventures.in
```

**Should show:** `31.97.233.176`

**If DNS is not pointing to server, you need to update DNS records:**
- **A Record:** `semiconventures.in` → `31.97.233.176`
- **A Record:** `www.semiconventures.in` → `31.97.233.176`

**Wait for DNS propagation (up to 48 hours).**

---

### Step 13: Test Domain HTTP

```bash
# Test HTTP access
curl http://semiconventures.in

# Test API via domain
curl http://semiconventures.in/api/components
```

**Expected output:** Returns HTML (React app) and JSON (API response).

---

### Step 14: Setup SSL Certificate (After DNS is Fixed)

```bash
# Install certbot (if not already installed)
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate for semiconventures.in
certbot --nginx -d semiconventures.in -d www.semiconventures.in
```

**Follow the prompts:**
- Enter your email address
- Agree to terms (type `A`)
- Choose whether to redirect HTTP to HTTPS (type `2` for Yes)

**Expected output:** SSL certificate installed successfully.

---

### Step 15: Verify Deployment

```bash
# Check PM2 status
pm2 list

# Check if semiconventures is online
pm2 status semiconventures

# Check Nginx status
systemctl status nginx

# Check if port 3003 is listening
netstat -tulpn | grep 3003

# Test HTTPS (after SSL setup)
curl https://semiconventures.in
```

---

## ✅ Verify Functionality Works Same as Localhost

### Test 1: Search Functionality

```bash
# Test search API (should search FindChips)
curl -X POST http://localhost:3003/api/search \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "LM358"}' \
  -v
```

**Expected output:** Returns JSON with component data from FindChips.

### Test 2: File Upload

```bash
# Create a test file
echo -e "LM358\nLM741\n555" > /tmp/test_parts.txt

# Test upload API
curl -X POST http://localhost:3003/api/upload \
  -F "file=@/tmp/test_parts.txt" \
  -v
```

**Expected output:** Returns JSON with extracted part numbers.

### Test 3: Components API

```bash
curl http://localhost:3003/api/components
```

**Expected output:** Returns JSON with saved components.

### Test 4: Export API

```bash
# Test export API
curl http://localhost:3003/api/export -o /tmp/test.xlsx

# Verify file was created
ls -lh /tmp/test.xlsx
```

**Expected output:** Downloads Excel file.

---

## 🎯 Expected Behavior (Same as Localhost)

### ✅ Search Part Number:
1. User enters part number (e.g., "LM358")
2. Clicks "Search"
3. App searches FindChips website
4. Displays results with: Manufacturer, Description, Price, Distributor, Stock
5. Saves to Excel file

### ✅ Upload File/Image:
1. User uploads file or image
2. App extracts part numbers using OCR/text extraction
3. App searches each part number from FindChips
4. Displays all results
5. Saves to Excel file

### ✅ Export to Excel:
1. User clicks "Export to Excel"
2. Downloads Excel file with all components
3. Or clicks "Export" on individual row
4. Downloads Excel file with that component

### ✅ Multi-user Support:
1. Each user has separate session
2. Each user has separate Excel file
3. No data shared between users

---

## 🔧 Troubleshooting

### Issue: Server still on port 3001

**Solution:**
```bash
# Verify .env file
cat .env

# Should show PORT=3003
# If not, recreate it:
cat > .env << EOF
PORT=3003
NODE_ENV=production
EOF

# Restart PM2
pm2 stop semiconventures
pm2 delete semiconventures
pm2 start server.js --name semiconventures
pm2 save
pm2 logs semiconventures
```

### Issue: Connection refused on port 3003

**Solution:**
```bash
# Check if server is running
pm2 list

# Check logs for errors
pm2 logs semiconventures

# Check if port is in use
netstat -tulpn | grep 3003

# Restart server
pm2 restart semiconventures
```

### Issue: SSL certificate failed

**Solution:**
1. **Verify DNS is pointing to server:**
   ```bash
   nslookup semiconventures.in
   ```

2. **Wait for DNS propagation (up to 48 hours)**

3. **Try SSL again:**
   ```bash
   certbot --nginx -d semiconventures.in -d www.semiconventures.in
   ```

### Issue: API calls not working

**Solution:**
1. **Check CORS settings in server.js**
2. **Verify API endpoints are accessible:**
   ```bash
   curl http://localhost:3003/api/components
   ```
3. **Check browser console for errors**
4. **Verify frontend is using relative URLs (already fixed)**

---

## 📝 All-in-One Quick Deploy Script

```bash
#!/bin/bash
# Quick deployment script for semiconventures.in

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/semiconventures.in

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin master

# Verify/Create .env file
echo "⚙️ Setting up .env file..."
cat > .env << EOF
PORT=3003
NODE_ENV=production
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend
npm install
cd ..

# Rebuild frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 stop semiconventures
pm2 delete semiconventures
pm2 start server.js --name semiconventures
pm2 save

# Test server
echo "✅ Testing server..."
sleep 2
curl http://localhost:3003

# Test Nginx
echo "🌐 Testing Nginx..."
nginx -t
systemctl reload nginx

echo "✅ Deployment complete!"
echo "📊 Check logs: pm2 logs semiconventures"
echo "🌐 Test domain: curl http://semiconventures.in"
```

---

## ✅ Deployment Checklist

- [ ] Connected to VPS
- [ ] Verified existing projects (not modified)
- [ ] Pulled latest code from GitHub
- [ ] Created/verified .env file (PORT=3003)
- [ ] Installed dependencies
- [ ] Rebuilt frontend
- [ ] Restarted PM2 (running on port 3003)
- [ ] Tested server locally (port 3003)
- [ ] Verified Nginx configuration (pointing to port 3003)
- [ ] Tested and reloaded Nginx
- [ ] Verified DNS (pointing to 31.97.233.176)
- [ ] Tested domain HTTP (http://semiconventures.in)
- [ ] Setup SSL certificate (https://semiconventures.in)
- [ ] Tested search functionality
- [ ] Tested file upload
- [ ] Tested Excel export
- [ ] All features work same as localhost

---

## 🎉 Deployment Complete!

**Your application should now work exactly the same as localhost:**
- ✅ Search functionality works (searches FindChips)
- ✅ File upload works (OCR and text extraction)
- ✅ Excel export works (downloads Excel files)
- ✅ All features work the same
- ✅ Multi-user support works (separate sessions)

**Access your site:**
- **HTTP:** http://semiconventures.in
- **HTTPS:** https://semiconventures.in (after SSL setup)

**Existing domains remain unaffected!** ✅

---

## 📞 Next Steps

1. **Test the website:** Visit http://semiconventures.in (or https://semiconventures.in after SSL)
2. **Test search:** Enter a part number (e.g., "LM358") and click "Search"
3. **Test file upload:** Upload a file or image with part numbers
4. **Test export:** Click "Export to Excel" to download the Excel file
5. **Verify all features work the same as localhost**

---

## 🔍 Verify Everything Works

### Test from Browser:
1. Open http://semiconventures.in (or https://semiconventures.in)
2. Enter part number "LM358"
3. Click "Search"
4. Verify results are displayed
5. Upload a file/image with part numbers
6. Verify part numbers are extracted and searched
7. Click "Export to Excel"
8. Verify Excel file is downloaded

### Test from Server:
```bash
# Test search
curl -X POST http://localhost:3003/api/search \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "LM358"}' \
  -v

# Test upload
echo -e "LM358\nLM741" > /tmp/test.txt
curl -X POST http://localhost:3003/api/upload \
  -F "file=@/tmp/test.txt" \
  -v

# Test export
curl http://localhost:3003/api/export -o /tmp/test.xlsx
```

---

## 🎯 Summary

**All commands are ready to deploy!** Follow the steps above to:
1. Pull latest code from GitHub
2. Update server configuration
3. Restart PM2 with correct port (3003)
4. Verify Nginx configuration
5. Setup SSL certificate
6. Test all functionality

**Your application will work exactly the same as localhost!** ✅

