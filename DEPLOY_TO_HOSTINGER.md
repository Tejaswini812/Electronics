# 🚀 Deploy to Hostinger VPS - Multi-Project Setup

## ⚠️ IMPORTANT: Existing Projects
- **VPS IP:** `31.97.233.176`
- **Domain:** `semiconventures.in`
- **Warning:** 2 other projects already exist on this VPS
- **Action:** Deploy in separate directory to avoid conflicts

---

## Step 1: Connect to VPS

```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

---

## Step 2: Verify Existing Projects (DO NOT DELETE)

```bash
# Check existing projects
ls -la /var/www/
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check running Node.js processes
pm2 list

# Check running services
systemctl status nginx
```

**⚠️ Note:** Do NOT modify or delete any existing project files!

---

## Step 3: Install Required Software (if not already installed)

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (if not installed)
npm install -g pm2

# Install Nginx (if not installed)
apt install -y nginx

# Install Git (if not installed)
apt install -y git
```

---

## Step 4: Create Project Directory

```bash
# Create directory for semiconventures.in
mkdir -p /var/www/semiconventures.in
cd /var/www/semiconventures.in
```

---

## Step 5: Clone Repository (Master Branch)

```bash
# Clone from GitHub (master branch)
git clone -b master https://github.com/Tejaswini812/Electronics.git .

# OR if clone fails, use:
git clone https://github.com/Tejaswini812/Electronics.git temp
cd temp
git checkout master
cd ..
mv temp/* .
mv temp/.git .
rm -rf temp
```

---

## Step 6: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Step 7: Build Frontend

```bash
cd frontend
npm run build
cd ..
```

---

## Step 8: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add these lines:
```
PORT=3001
NODE_ENV=production
```

Save: `Ctrl+X`, then `Y`, then `Enter`

**Note:** The application is already configured for production:
- ✅ CORS allows `semiconventures.in` domain
- ✅ Secure cookies enabled for HTTPS
- ✅ Frontend uses relative API URLs (works with Nginx proxy)

---

## Step 9: Verify Production Configuration

The application is already configured for production:
- ✅ `server.js` serves static files from `frontend/build`
- ✅ CORS configured for `semiconventures.in` domain
- ✅ Secure cookies enabled for HTTPS
- ✅ Frontend uses relative API URLs

No changes needed!

---

## Step 10: Start Application with PM2

```bash
# Start the application
pm2 start server.js --name "semiconventures"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it gives you
```

---

## Step 11: Configure Nginx for semiconventures.in

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/semiconventures.in
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name semiconventures.in www.semiconventures.in;

    # Frontend static files
    location / {
        root /var/www/semiconventures.in/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
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

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 12: Enable Nginx Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## Step 13: Configure SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d semiconventures.in -d www.semiconventures.in

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

---

## Step 14: Verify Deployment

```bash
# Check PM2 status
pm2 list
pm2 logs semiconventures

# Check Nginx status
systemctl status nginx

# Check if port 3001 is listening
netstat -tlnp | grep 3001

# Test the application
curl http://localhost:3001/api/components
```

---

## Step 15: Firewall Configuration (if needed)

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check firewall status
ufw status
```

---

## 🔧 Troubleshooting

### Application not starting:
```bash
# Check PM2 logs
pm2 logs semiconventures

# Restart application
pm2 restart semiconventures
```

### Nginx errors:
```bash
# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx config
nginx -t
```

### Port already in use:
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process if needed (BE CAREFUL - check if it's another project!)
# kill -9 <PID>
```

### Frontend not loading:
```bash
# Rebuild frontend
cd /var/www/semiconventures.in/frontend
npm run build
cd ..
pm2 restart semiconventures
```

---

## 📋 Quick Reference Commands

```bash
# View PM2 processes
pm2 list

# View logs
pm2 logs semiconventures

# Restart application
pm2 restart semiconventures

# Stop application
pm2 stop semiconventures

# Reload Nginx
systemctl reload nginx

# Check application status
curl http://localhost:3001/api/components
```

---

## ✅ Verification Checklist

- [ ] Connected to VPS successfully
- [ ] Verified existing projects (not modified)
- [ ] Created `/var/www/semiconventures.in` directory
- [ ] Cloned repository from GitHub (master branch)
- [ ] Installed all dependencies
- [ ] Built frontend successfully
- [ ] Started application with PM2
- [ ] Created Nginx configuration
- [ ] Enabled Nginx site
- [ ] Tested Nginx configuration
- [ ] Reloaded Nginx
- [ ] Configured SSL certificate
- [ ] Tested application in browser
- [ ] Verified domain `semiconventures.in` is working

---

## 🎯 Final URLs

- **Frontend:** https://semiconventures.in
- **Backend API:** https://semiconventures.in/api
- **PM2 Dashboard:** Check with `pm2 list`

---

## ⚠️ Important Notes

1. **DO NOT** modify existing projects in `/var/www/`
2. **DO NOT** delete or modify existing Nginx configurations
3. **DO NOT** change ports of existing applications
4. Always test Nginx config before reloading: `nginx -t`
5. Keep PM2 process names unique: `semiconventures`
6. Monitor logs regularly: `pm2 logs semiconventures`

---

## 🔄 Updating the Application

```bash
# SSH into VPS
ssh root@31.97.233.176

# Navigate to project
cd /var/www/semiconventures.in

# Pull latest changes
git pull origin master

# Rebuild frontend
cd frontend
npm run build
cd ..

# Restart application
pm2 restart semiconventures
```

---

**Ready to deploy! Follow the steps above carefully.** 🚀

