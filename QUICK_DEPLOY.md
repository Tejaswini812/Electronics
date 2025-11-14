# ⚡ Quick Deployment Commands - Copy & Paste

## 🔐 Step 1: Connect to VPS

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

---

## 🔍 Step 2: Check Existing Projects (VERIFY - DO NOT MODIFY)

```bash
pm2 list
ls -la /var/www/
ls -la /etc/nginx/sites-available/
```

**Purpose:** See what's already running. **DO NOT modify anything here!**

---

## 📁 Step 3: Create Project Directory

```bash
mkdir -p /var/www/semiconventures.in
cd /var/www/semiconventures.in
```

---

## 📥 Step 4: Clone Repository

```bash
git clone -b master https://github.com/Tejaswini812/Electronics.git .
ls -la
```

---

## 📦 Step 5: Install Dependencies

```bash
npm install
cd frontend
npm install
cd ..
```

---

## 🔨 Step 6: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

---

## ⚙️ Step 7: Create .env File

```bash
cat > .env << EOF
PORT=3003
NODE_ENV=production
EOF
```

---

## 🚀 Step 8: Start with PM2

```bash
npm install -g pm2
pm2 start server.js --name semiconventures
pm2 save
pm2 startup
```

**Follow the command that `pm2 startup` outputs!**

---

## 🌐 Step 9: Create Nginx Config

```bash
nano /etc/nginx/sites-available/semiconventures.in
```

**Paste this configuration:**

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

## 🔗 Step 10: Enable Nginx Site

```bash
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/
```

---

## ✅ Step 11: Test & Reload Nginx

```bash
nginx -t
```

**If test passes (shows "syntax is ok"), then:**

```bash
systemctl reload nginx
```

**If test fails, check the error and fix the configuration!**

---

## 🔒 Step 12: Setup SSL Certificate

```bash
apt-get update
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d semiconventures.in -d www.semiconventures.in
```

**Follow the prompts:**
- Enter your email
- Agree to terms (type `A`)
- Choose redirect HTTP to HTTPS (type `2` for Yes)

---

## ✅ Step 13: Verify Deployment

```bash
# Check PM2
pm2 list
pm2 logs semiconventures

# Check Nginx
systemctl status nginx

# Test locally
curl http://localhost:3003
```

---

## 🎯 Done!

Your site should now be live at:
- **HTTP:** http://semiconventures.in
- **HTTPS:** https://semiconventures.in

**Existing domains remain unaffected!** ✅

---

## 🔧 Useful Commands (After Deployment)

```bash
# View logs
pm2 logs semiconventures

# Restart app
pm2 restart semiconventures

# Update code (if needed)
cd /var/www/semiconventures.in
git pull origin master
npm install
cd frontend && npm run build && cd ..
pm2 restart semiconventures
```

