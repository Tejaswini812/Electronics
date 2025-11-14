# 🔧 Commands to Fix 301 Redirect

## Step 1: Check if Server is Running

```bash
cd /var/www/semiconventures.in
pm2 list
pm2 logs semiconventures
```

**Should show:** `Server running on port 3003` ✅

---

## Step 2: Test Local Server

```bash
curl http://localhost:3003
curl http://localhost:3003/api/components
```

**Expected:** Returns HTML and JSON ✅

---

## Step 3: Check Nginx Configuration

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
        ...
    }
}
```

---

## Step 4: Check if Site is Enabled

```bash
ls -la /etc/nginx/sites-enabled/ | grep semiconventures
```

**Should show:** `semiconventures.in` is enabled ✅

**If not enabled:**
```bash
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/
```

---

## Step 5: Test and Reload Nginx

```bash
nginx -t
systemctl reload nginx
```

**Expected:** `syntax is ok` and `test is successful` ✅

---

## Step 6: Check Port Status

```bash
netstat -tulpn | grep 3003
netstat -tulpn | grep :80
```

**Expected:** Shows process listening on ports ✅

---

## Step 7: Test with IP Address

```bash
curl -H "Host: semiconventures.in" http://31.97.233.176
```

**Expected:** Returns HTML (React app) ✅

---

## Step 8: Check Hostinger Panel

**The "openresty" redirect might be from Hostinger's infrastructure:**

1. **Log in to Hostinger control panel**
2. **Go to "Domains" → "semiconventures.in"**
3. **Check for:**
   - CDN option (disable if enabled)
   - Proxy option (disable if enabled)
   - SSL/HTTPS redirect (check settings)
   - Load balancer (check if enabled)

---

## Step 9: Check Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**Try accessing domain and see what logs show**

---

## Step 10: Verify PM2 is Running

```bash
pm2 restart semiconventures
pm2 save
pm2 logs semiconventures
```

**Press Ctrl+C to exit logs**

---

## 🎯 Quick All-in-One Commands

```bash
# Navigate to project
cd /var/www/semiconventures.in

# Check PM2
pm2 list
pm2 restart semiconventures
pm2 save

# Check Nginx
cat /etc/nginx/sites-available/semiconventures.in
nginx -t
systemctl reload nginx

# Test local server
curl http://localhost:3003
curl http://localhost:3003/api/components

# Test with IP
curl -H "Host: semiconventures.in" http://31.97.233.176

# Check ports
netstat -tulpn | grep 3003
netstat -tulpn | grep :80
```

---

## 🔍 Most Likely Issue

**The "openresty" 301 redirect is likely from Hostinger's infrastructure:**

1. **Hostinger might have a CDN or proxy enabled**
2. **Hostinger might be using OpenResty as a load balancer**
3. **Domain might need special configuration in Hostinger panel**

### Solution:
1. **Check Hostinger control panel**
2. **Disable CDN or proxy if enabled**
3. **Wait a few minutes for changes to propagate**
4. **Test domain again**

---

## ✅ After Fix

**Domain should return:**
- ✅ HTML (React app) instead of 301 redirect
- ✅ API endpoints work correctly
- ✅ SSL certificate can be installed
- ✅ All features work same as localhost

