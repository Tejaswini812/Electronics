# 🚀 Push to GitHub - Complete Guide

## ✅ Already Completed:
1. ✅ Git initialized
2. ✅ Files added
3. ✅ Files committed
4. ✅ Remote added
5. ✅ Branch renamed to `main`

## 🔐 Step 1: GitHub Authentication

GitHub requires a **Personal Access Token** (PAT) for HTTPS authentication.

### Create a Personal Access Token:

1. **Go to GitHub:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name: `Electronics Project`
   - Select expiration: `90 days` (or your preference)
   - Select scopes: Check `repo` (full control of private repositories)

3. **Copy the Token:**
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 📤 Step 2: Push to GitHub

### Option 1: Push with Token (Recommended)

Run this command and when prompted:
- **Username:** `Tejaswini812`
- **Password:** Paste your Personal Access Token (not your GitHub password)

```bash
git push -u origin main
```

### Option 2: Push with Token in URL (Alternative)

If you want to avoid entering credentials each time:

```bash
git remote set-url origin https://ghp_YOUR_TOKEN@github.com/Tejaswini812/Electronics.git
git push -u origin main
```

Replace `YOUR_TOKEN` with your actual Personal Access Token.

### Option 3: Use GitHub Desktop (Easier)

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository → Select `my-web-project` folder
4. Click "Publish repository"
5. Select repository: `Tejaswini812/Electronics`
6. Click "Publish repository"

## 🔄 Step 3: Verify Push

After pushing, verify on GitHub:
- Visit: https://github.com/Tejaswini812/Electronics
- You should see all your files there!

## 📋 Complete Command List

If you need to redo everything, here are all commands:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit files
git commit -m "Initial commit: Component Search System with MERN stack"

# 4. Add remote
git remote add origin https://github.com/Tejaswini812/Electronics.git

# 5. Rename branch to main
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## 🚨 Troubleshooting

### Error: "Authentication failed"
- Make sure you're using a Personal Access Token, not your GitHub password
- Generate a new token if needed

### Error: "Repository not found"
- Check if the repository exists: https://github.com/Tejaswini812/Electronics
- Make sure you have write access to the repository

### Error: "Permission denied"
- Check your GitHub username and token
- Make sure the token has `repo` scope

## 🔄 Future Updates

After the initial push, to update GitHub:

```bash
# 1. Add changed files
git add .

# 2. Commit changes
git commit -m "Your commit message"

# 3. Push to GitHub
git push
```

## 🌐 Deploy to Hostinger VPS

After pushing to GitHub, you can deploy to Hostinger VPS:

1. **SSH into your VPS:**
   ```bash
   ssh username@your-hostinger-ip
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/Tejaswini812/Electronics.git
   cd Electronics
   ```

3. **Install dependencies:**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

4. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "component-search"
   pm2 save
   pm2 startup
   ```

## ✅ Success Checklist

- [ ] Personal Access Token created
- [ ] Git repository initialized
- [ ] Files committed
- [ ] Remote added
- [ ] Pushed to GitHub
- [ ] Verified on GitHub
- [ ] Ready to deploy to Hostinger VPS

---

**Need Help?**
- GitHub Docs: https://docs.github.com/en/authentication
- Git Docs: https://git-scm.com/doc

