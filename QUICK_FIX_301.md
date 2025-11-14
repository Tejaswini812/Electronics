# 🔧 Quick Fix for 301 Redirect

## ⚠️ Issue:
- DNS is correct ✅ (points to 31.97.233.176)
- Domain returns 301 redirect from "openresty" ❌

## 🔍 Most Likely Cause:
**Hostinger has a CDN or proxy enabled** that's causing the redirect.

---

## 🔧 Step 1: Check Server Locally (On VPS)

```bash
cd /var/www/semiconventures.in
curl http://localhost:3003
```

**Expected:** Returns HTML (React app) ✅

---

## 🔧 Step 2: Check Nginx Configuration

```bash
cat /etc/nginx/sites-available/semiconventures.in
nginx -t
systemctl reload nginx
```

**Expected:** Config is correct and reloaded ✅

---

## 🔧 Step 3: Check Hostinger Panel (IMPORTANT!)

**The "openresty" redirect is likely from Hostinger's infrastructure:**

1. **Log in to Hostinger control panel**
2. **Go to "Domains" → "semiconventures.in"**
3. **Check for:**
   - **CDN option** → **Disable if enabled**
   - **Proxy option** → **Disable if enabled**
   - **SSL/HTTPS redirect** → **Check settings**
   - **Load balancer** → **Check if enabled**

4. **Save changes and wait 5-10 minutes**

---

## 🔧 Step 4: Test Domain Again

```bash
curl http://semiconventures.in
```

**Expected:** Returns HTML (React app) ✅
**NOT:** 301 redirect ❌

---

## 🔧 Step 5: If Still Redirecting

### Option 1: Check if Hostinger has Cloudflare or CDN
- Look for "Cloudflare" or "CDN" in Hostinger panel
- Disable if enabled

### Option 2: Check DNS Settings in Hostinger
- Verify A records are correct
- Remove any CNAME records pointing to CDN

### Option 3: Check if Domain has SSL/HTTPS redirect
- Check SSL settings in Hostinger panel
- Disable HTTPS redirect if enabled

---

## 🔧 Step 6: Verify PM2 is Running

```bash
pm2 list
pm2 restart semiconventures
pm2 save
```

**Should show:** `semiconventures` is online ✅

---

## 🔧 Step 7: Test with IP Address

```bash
curl -H "Host: semiconventures.in" http://31.97.233.176
```

**Expected:** Returns HTML (React app) ✅

**If this works, the issue is definitely in Hostinger's infrastructure.**

---

## 🎯 Quick Commands (Copy & Paste)

```bash
# Check server locally
cd /var/www/semiconventures.in
curl http://localhost:3003

# Check Nginx
nginx -t
systemctl reload nginx

# Check PM2
pm2 list
pm2 restart semiconventures

# Test with IP
curl -H "Host: semiconventures.in" http://31.97.233.176
```

---

## ✅ After Fix

**Domain should return:**
- ✅ HTML (React app) instead of 301 redirect
- ✅ API endpoints work correctly
- ✅ SSL certificate can be installed
- ✅ All features work same as localhost

---

## 📝 Summary

**Most likely issue:** Hostinger has CDN or proxy enabled

**Solution:**
1. Check Hostinger control panel
2. Disable CDN or proxy if enabled
3. Wait 5-10 minutes
4. Test domain again

**If still redirecting:**
1. Check DNS settings in Hostinger
2. Check SSL/HTTPS redirect settings
3. Check if Cloudflare is enabled
4. Contact Hostinger support if needed

