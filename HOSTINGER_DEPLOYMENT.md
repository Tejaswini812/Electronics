# 🚀 Hostinger VPS Deployment Guide - semiconventures.in

## ⚠️ IMPORTANT: Do NOT affect existing domains
- **Existing Domain 1:** villagecounty.in
- **Existing Domain 2:** startup-interns.in
- **New Domain:** semiconventures.in

---

## Step 1: Connect to VPS

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

**Note:** If SSH key verification is required, type `yes` when prompted.

---

## Step 2: Check Existing Projects (Verify Structure)

```bash
# Check what's running
pm2 list

# Check existing directories (DO NOT MODIFY)
ls -la /var/www/
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/
```

**Purpose:** Understand the existing setup without modifying anything.

---

## Step 3: Create Separate Directory for New Project

```bash
# Create directory for semiconventures.in
mkdir -p /var/www/semiconventures.in
cd /var/www/semiconventures.in
```

---

## Step 4: Clone Repository (Master Branch)

```bash
# Clone the repository
git clone -b master https://github.com/Tejaswini812/Electronics.git .

# Verify files are cloned
ls -la
```

---

## Step 5: Install Node.js Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Step 6: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

This creates a `build` folder in the frontend directory.

---

## Step 7: Update server.js for Production

```bash
# Edit server.js to serve static files and use production port
nano server.js
```

**Add this code at the end of server.js (before app.listen):**

```javascript
// Serve static files from React app
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});
```

**Change the port (use a unique port, e.g., 3003):**

```javascript
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 8: Create .env File (Optional - for environment variables)

```bash
nano .env
```

**Add:**
```
PORT=3003
NODE_ENV=production
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 9: Start Application with PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the application
pm2 start server.js --name semiconventures

# Save PM2 configuration
pm2 save

# Check status
pm2 list
pm2 logs semiconventures
```

**Verify:** The app should be running on port 3003.

---

## Step 10: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration for semiconventures.in
nano /etc/nginx/sites-available/semiconventures.in
```

**Add this configuration:**

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

**Save:** `Ctrl + X`, then `Y`, then `Enter`

---

## Step 11: Enable Nginx Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/

# Test Nginx configuration (VERY IMPORTANT - checks for errors)
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## Step 12: Configure SSL Certificate (Let's Encrypt)

```bash
# Install Certbot (if not already installed)
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate for semiconventures.in
certbot --nginx -d semiconventures.in -d www.semiconventures.in

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

---

## Step 13: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check if port 3003 is listening
netstat -tulpn | grep 3003

# Test the domain
curl http://localhost:3003
```

---

## Step 14: Set Up Auto-restart on Reboot

```bash
# Generate startup script
pm2 startup

# Follow the command it outputs (usually something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Save PM2 process list
pm2 save
```

---

## ✅ Verification Checklist

- [ ] PM2 process `semiconventures` is running
- [ ] Application is accessible on port 3003 locally
- [ ] Nginx configuration test passes (`nginx -t`)
- [ ] Domain `semiconventures.in` resolves correctly
- [ ] SSL certificate is installed
- [ ] Existing domains (villagecounty.in, startup-interns.in) still work
- [ ] PM2 auto-start is configured

---

## 🔧 Troubleshooting Commands

```bash
# View PM2 logs
pm2 logs semiconventures

# Restart application
pm2 restart semiconventures

# Stop application
pm2 stop semiconventures

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View Nginx access logs
tail -f /var/log/nginx/access.log

# Check all running Node processes
ps aux | grep node

# Check all PM2 processes
pm2 list

# Check port usage
netstat -tulpn | grep LISTEN
```

---

## 🚨 Important Notes

1. **DO NOT modify** existing project directories:
   - `/var/www/villagecounty.in/` (if exists)
   - `/var/www/startup-interns.in/` (if exists)

2. **DO NOT modify** existing Nginx configurations:
   - `/etc/nginx/sites-available/villagecounty.in`
   - `/etc/nginx/sites-available/startup-interns.in`

3. **Use a unique port** (3003) to avoid conflicts with existing projects

4. **Always test Nginx** configuration before reloading: `nginx -t`

5. **Monitor PM2 logs** if the application doesn't start: `pm2 logs semiconventures`

---

## 📝 Quick Reference Commands

```bash
# Navigate to project
cd /var/www/semiconventures.in

# Restart application
pm2 restart semiconventures

# View logs
pm2 logs semiconventures

# Update code (if needed)
git pull origin master
npm install
cd frontend && npm run build && cd ..
pm2 restart semiconventures
```

---

## 🎯 Deployment Complete!

Your application should now be accessible at:
- **HTTP:** http://semiconventures.in
- **HTTPS:** https://semiconventures.in (after SSL setup)

**Existing domains remain unaffected!** ✅

