# 🔧 DNS Fix and Verification Guide

## ⚠️ IMPORTANT: Current Status

### ✅ What's Working:
- Server running on port 3003 ✅
- PM2 process online ✅
- Nginx running and configured ✅
- Server responds locally ✅
- Existing projects unaffected ✅

### ❌ Issue Found:
- **DNS is pointing to wrong IP:**
  - Expected: `31.97.233.176`
  - Actual: `34.120.137.41`
  - This causes SSL certificate to fail
  - This causes domain to return 301 redirect

---

## 🔧 Step 1: Fix DNS Records

### Update DNS Records in Your Domain Registrar:

1. **Log in to your domain registrar** (where you bought semiconventures.in)

2. **Find DNS management section**

3. **Update A Records:**
   - **A Record:** `semiconventures.in` → `31.97.233.176`
   - **A Record:** `www.semiconventures.in` → `31.97.233.176`

4. **Save changes**

5. **Wait for DNS propagation** (up to 48 hours, usually 1-2 hours)

---

## ✅ Step 2: Verify DNS After Update

### On Server, Run:
```bash
nslookup semiconventures.in
```

**Should show:**
```
Name:   semiconventures.in
Address: 31.97.233.176
```

**NOT:**
```
Address: 34.120.137.41  ❌ (Wrong IP)
```

---

## ✅ Step 3: Test API Endpoints

### Test Search Functionality:
```bash
curl -X POST http://localhost:3003/api/search \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "LM358"}' \
  -v
```

**Expected:** Returns JSON with component data from FindChips

### Test Components API:
```bash
curl http://localhost:3003/api/components
```

**Expected:** Returns JSON with saved components (or empty array if no data)

### Test Export API:
```bash
curl http://localhost:3003/api/export -o /tmp/test.xlsx
ls -lh /tmp/test.xlsx
```

**Expected:** Downloads Excel file

---

## ✅ Step 4: Verify Domain After DNS Fix

### Wait for DNS Propagation (1-2 hours)

### Then Test:
```bash
# Test HTTP
curl http://semiconventures.in

# Test API
curl http://semiconventures.in/api/components
```

**Expected:** Returns HTML (React app) and JSON (API response)

**NOT:** 301 redirect ❌

---

## 🔒 Step 5: Setup SSL Certificate (After DNS is Fixed)

### Once DNS points to 31.97.233.176:

```bash
certbot --nginx -d semiconventures.in -d www.semiconventures.in
```

**Follow prompts:**
- Enter email
- Agree to terms (type `A`)
- Choose redirect HTTP to HTTPS (type `2` for Yes)

**Expected:** SSL certificate installed successfully

---

## ✅ Step 6: Verify Everything Works

### Test from Browser:
1. Open http://semiconventures.in (or https:// after SSL)
2. Enter part number "LM358"
3. Click "Search"
4. Verify results are displayed from FindChips
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
```

---

## 🎯 Summary

### Current Status:
- ✅ Server running on port 3003
- ✅ PM2 process online
- ✅ Nginx running and configured
- ✅ Server responds locally
- ✅ Existing projects unaffected
- ❌ DNS pointing to wrong IP (34.120.137.41 instead of 31.97.233.176)

### What to Do:
1. **Fix DNS records** in domain registrar
2. **Wait for DNS propagation** (1-2 hours)
3. **Verify DNS** points to 31.97.233.176
4. **Test domain** (should work, not 301 redirect)
5. **Setup SSL certificate** (after DNS is fixed)
6. **Test all functionality** (search, upload, export)

---

## 🔍 Troubleshooting

### Issue: DNS still shows wrong IP

**Solution:**
- Wait longer for DNS propagation (up to 48 hours)
- Clear DNS cache: `sudo systemd-resolve --flush-caches`
- Check DNS records in domain registrar again

### Issue: API returns empty

**Solution:**
- Check server logs: `pm2 logs semiconventures`
- Test API directly: `curl http://localhost:3003/api/components`
- Verify server is running: `pm2 list`

### Issue: SSL certificate still fails

**Solution:**
- Verify DNS points to 31.97.233.176: `nslookup semiconventures.in`
- Wait for DNS propagation
- Try SSL again: `certbot --nginx -d semiconventures.in -d www.semiconventures.in`

---

## ✅ Final Checklist

- [ ] DNS records updated in domain registrar
- [ ] DNS points to 31.97.233.176 (verified with nslookup)
- [ ] Domain accessible (not 301 redirect)
- [ ] SSL certificate installed
- [ ] Search functionality works
- [ ] File upload works
- [ ] Excel export works
- [ ] All features work same as localhost
- [ ] Existing projects unaffected

---

## 🎉 Deployment Complete!

**After DNS is fixed:**
- ✅ Domain will be accessible
- ✅ SSL certificate will work
- ✅ All features will work same as localhost
- ✅ Search, upload, export will work
- ✅ Existing projects remain unaffected

