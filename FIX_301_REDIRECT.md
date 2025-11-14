# 🔧 Fix 301 Redirect Issue - semiconventures.in

## ⚠️ Issue Found:

**DNS is correct ✅**
- semiconventures.in → 31.97.233.176 ✅
- www.semiconventures.in → 31.97.233.176 ✅

**But domain returns 301 redirect from "openresty" ❌**
- This suggests there's a load balancer or CDN in front
- Or Hostinger has special configuration needed

---

## 🔧 Step 1: Check if Server is Accessible Directly

### Test local server:
```bash
curl http://localhost:3003
```

**Expected:** Returns HTML (React app) ✅

### Test server via IP:
```bash
curl http://31.97.233.176:3003
```

**Expected:** Returns HTML (React app) ✅

---

## 🔧 Step 2: Check Nginx Configuration

### Verify Nginx config:
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

---

## 🔧 Step 3: Check if Site is Enabled

### Verify site is enabled:
```bash
ls -la /etc/nginx/sites-enabled/ | grep semiconventures
```

**Should show:** `semiconventures.in` is enabled ✅

### If not enabled, enable it:
```bash
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/
```

---

## 🔧 Step 4: Check Nginx Status and Reload

### Test Nginx config:
```bash
nginx -t
```

**Expected:** `syntax is ok` and `test is successful` ✅

### Reload Nginx:
```bash
systemctl reload nginx
```

---

## 🔧 Step 5: Check if Hostinger Has Load Balancer/CDN

### The "openresty" message suggests:
- Hostinger might be using OpenResty (nginx variant) as a load balancer
- There might be a CDN or proxy in front
- Domain might need special configuration in Hostinger panel

### Check Hostinger Panel:
1. Log in to Hostinger control panel
2. Go to "Domains" → "semiconventures.in"
3. Check if there's a CDN or SSL option enabled
4. Check if there's a proxy or load balancer option
5. Disable any CDN or proxy if enabled
6. Check DNS settings again

---

## 🔧 Step 6: Check if PM2 Process is Running

### Verify PM2:
```bash
pm2 list
```

**Should show:** `semiconventures` is online ✅

### Check logs:
```bash
pm2 logs semiconventures
```

**Should show:** `Server running on port 3003` ✅

---

## 🔧 Step 7: Check if Port 3003 is Listening

### Check port:
```bash
netstat -tulpn | grep 3003
```

**Expected:** Shows process listening on port 3003 ✅

### Check if Nginx is listening on port 80:
```bash
netstat -tulpn | grep :80
```

**Expected:** Shows nginx listening on port 80 ✅

---

## 🔧 Step 8: Test Direct Access

### Test via localhost:
```bash
curl http://localhost:3003
curl http://localhost:3003/api/components
```

**Expected:** Returns HTML and JSON ✅

### Test via IP:
```bash
curl -H "Host: semiconventures.in" http://31.97.233.176
```

**Expected:** Returns HTML (React app) ✅

---

## 🔧 Step 9: Check Hostinger DNS Settings

### The 301 redirect might be from Hostinger's infrastructure

### Check in Hostinger Panel:
1. Go to "DNS / Nameservers"
2. Check if there are any CNAME records pointing to CDN
3. Check if there's a proxy enabled
4. Verify A records are correct:
   - @ → 31.97.233.176
   - www → 31.97.233.176

---

## 🔧 Step 10: Try Direct IP Access

### If domain redirects, try IP directly:
```bash
curl -H "Host: semiconventures.in" http://31.97.233.176
```

**Expected:** Returns HTML (React app) ✅

---

## 🔧 Step 11: Check Nginx Access Logs

### Check access logs:
```bash
tail -f /var/log/nginx/access.log
```

### Check error logs:
```bash
tail -f /var/log/nginx/error.log
```

### Try accessing domain and see what logs show

---

## 🔧 Step 12: Disable CDN/Proxy in Hostinger (If Enabled)

### If Hostinger has CDN or proxy:
1. Log in to Hostinger control panel
2. Go to "Domains" → "semiconventures.in"
3. Look for "CDN" or "Proxy" settings
4. Disable CDN or proxy if enabled
5. Wait a few minutes for changes to propagate

---

## ✅ Expected Behavior After Fix

### Domain should return:
```html
<!doctype html><html lang="en">...
```

**NOT:**
```html
<html><head><title>301 Moved Permanently</title></head>...
```

---

## 🎯 Quick Fix Commands

```bash
# Navigate to project
cd /var/www/semiconventures.in

# Check PM2
pm2 list
pm2 logs semiconventures

# Check Nginx config
cat /etc/nginx/sites-available/semiconventures.in
nginx -t
systemctl reload nginx

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/ | grep semiconventures

# Test local server
curl http://localhost:3003
curl http://localhost:3003/api/components

# Test via IP
curl -H "Host: semiconventures.in" http://31.97.233.176

# Check port
netstat -tulpn | grep 3003
netstat -tulpn | grep :80

# Check logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📝 Summary

### Current Status:
- ✅ DNS points to 31.97.233.176
- ✅ Server running on port 3003
- ✅ PM2 process online
- ❌ Domain returns 301 redirect from "openresty"

### Possible Causes:
1. Hostinger CDN or proxy enabled
2. OpenResty load balancer in front
3. Nginx configuration issue
4. Site not enabled in Nginx

### Next Steps:
1. Check if server responds locally
2. Check Nginx configuration
3. Check Hostinger panel for CDN/proxy
4. Disable CDN/proxy if enabled
5. Test domain again

---

## 🎉 After Fix

### Domain should work:
- ✅ http://semiconventures.in returns HTML
- ✅ http://semiconventures.in/api/components returns JSON
- ✅ SSL certificate can be installed
- ✅ All features work same as localhost

