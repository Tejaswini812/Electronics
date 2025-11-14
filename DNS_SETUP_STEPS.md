# 🌐 DNS Setup Steps for semiconventures.in

## Step 1: Add DNS Records in Hostinger

### Record 1: Root Domain (@)
1. **Type:** A (already selected)
2. **Name:** @ (already filled)
3. **Points to:** `31.97.233.176`
4. **TTL:** 14400 (keep default)
5. Click **"Add Record"**

### Record 2: WWW Subdomain
1. **Type:** A
2. **Name:** `www`
3. **Points to:** `31.97.233.176`
4. **TTL:** 14400 (keep default)
5. Click **"Add Record"**

---

## Step 2: Verify DNS Records Added

After adding both records, you should see in the table:
- **Type:** A, **Name:** @, **Content:** 31.97.233.176
- **Type:** A, **Name:** www, **Content:** 31.97.233.176

---

## Step 3: Wait for DNS Propagation

**Wait 1-2 hours** (can take up to 48 hours) for DNS to propagate globally.

---

## Step 4: Verify DNS on Server

### Connect to VPS:
```bash
ssh root@31.97.233.176
# Password: Startup8093@123
```

### Check DNS:
```bash
nslookup semiconventures.in
```

**Expected output:**
```
Name:   semiconventures.in
Address: 31.97.233.176  ✅
```

**If still shows wrong IP (34.120.137.41), wait longer for propagation.**

### Check www subdomain:
```bash
nslookup www.semiconventures.in
```

**Expected output:**
```
Name:   www.semiconventures.in
Address: 31.97.233.176  ✅
```

---

## Step 5: Test Domain After DNS Propagation

### Test HTTP:
```bash
curl http://semiconventures.in
```

**Expected:** Returns HTML (React app)
**NOT:** 301 redirect ❌

### Test API:
```bash
curl http://semiconventures.in/api/components
```

**Expected:** Returns JSON

---

## Step 6: Setup SSL Certificate

### Once DNS points to 31.97.233.176:

```bash
cd /var/www/semiconventures.in
certbot --nginx -d semiconventures.in -d www.semiconventures.in
```

**Follow prompts:**
- Enter your email address
- Agree to terms (type `A`)
- Choose redirect HTTP to HTTPS (type `2` for Yes)

**Expected:** SSL certificate installed successfully ✅

---

## Step 7: Verify Everything Works

### Test from Browser:
1. Open **https://semiconventures.in** (or http:// before SSL)
2. Enter part number **"LM358"**
3. Click **"Search"**
4. Verify results are displayed from FindChips ✅
5. Upload a file/image with part numbers
6. Verify part numbers are extracted and searched ✅
7. Click **"Export to Excel"**
8. Verify Excel file is downloaded ✅

### Test from Server:
```bash
# Test search (should search FindChips)
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
ls -lh /tmp/test.xlsx
```

---

## ✅ Final Checklist

- [ ] DNS A record added for @ (root domain) → 31.97.233.176
- [ ] DNS A record added for www → 31.97.233.176
- [ ] Waited for DNS propagation (1-2 hours)
- [ ] Verified DNS points to 31.97.233.176 (nslookup)
- [ ] Domain accessible (not 301 redirect)
- [ ] SSL certificate installed
- [ ] Search functionality works
- [ ] File upload works
- [ ] Excel export works
- [ ] All features work same as localhost
- [ ] Existing projects unaffected

---

## 🎉 Deployment Complete!

**After DNS is set up:**
- ✅ Domain will be accessible
- ✅ SSL certificate will work
- ✅ All features will work same as localhost
- ✅ Search, upload, export will work
- ✅ Existing projects remain unaffected

---

## 🔍 Troubleshooting

### Issue: DNS still shows wrong IP after 2 hours

**Solution:**
- Wait longer (up to 48 hours for full propagation)
- Clear DNS cache: `sudo systemd-resolve --flush-caches`
- Check DNS records in Hostinger again
- Try different DNS server: `nslookup semiconventures.in 8.8.8.8`

### Issue: Domain still returns 301 redirect

**Solution:**
- Verify DNS points to 31.97.233.176: `nslookup semiconventures.in`
- Wait for DNS propagation
- Clear browser cache
- Try incognito/private mode

### Issue: SSL certificate fails

**Solution:**
- Verify DNS points to 31.97.233.176: `nslookup semiconventures.in`
- Wait for DNS propagation
- Make sure domain is accessible (not 301 redirect)
- Try SSL again: `certbot --nginx -d semiconventures.in -d www.semiconventures.in`

---

## 📝 Quick Reference

**DNS Records to Add:**
1. **A Record:** @ → 31.97.233.176
2. **A Record:** www → 31.97.233.176

**Server IP:** 31.97.233.176

**Domain:** semiconventures.in

**After DNS Setup:**
1. Wait 1-2 hours
2. Verify DNS: `nslookup semiconventures.in`
3. Test domain: `curl http://semiconventures.in`
4. Setup SSL: `certbot --nginx -d semiconventures.in -d www.semiconventures.in`
5. Test functionality

