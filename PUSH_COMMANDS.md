# 🚀 Commands to Push to GitHub

## Step-by-Step Commands:

```bash
# 1. Navigate to project directory
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project

# 2. Check current branch
git branch

# 3. Make sure you're on master branch
git branch -M master

# 4. Check remote (should be https://github.com/Tejaswini812/Electronics.git)
git remote -v

# 5. If remote doesn't exist, add it:
git remote add origin https://github.com/Tejaswini812/Electronics.git

# 6. Add all files
git add .

# 7. Commit changes
git commit -m "Initial commit: Component Search System with MERN stack"

# 8. Push to GitHub (master branch)
git push -u origin master
```

## 🚨 If Push Fails (Force Push):

If you get an error that the remote has different content, use force push:

```bash
git push -u origin master --force
```

## ✅ Verify Push:

```bash
# Check status
git status

# Check remote branches
git branch -a

# Verify files on remote
git ls-tree -r --name-only origin/master
```

## 📋 Quick Copy-Paste (All in One):

```bash
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project
git branch -M master
git remote add origin https://github.com/Tejaswini812/Electronics.git
git add .
git commit -m "Initial commit: Component Search System with MERN stack"
git push -u origin master --force
```

---

**Note:** If you get authentication error, you'll need a Personal Access Token from GitHub.

