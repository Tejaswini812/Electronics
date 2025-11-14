# 🗑️ Delete Repository and Create New One - Step by Step

## ⚠️ IMPORTANT: Back Up First
**All your files are safe locally** - they're in your `my-web-project` folder. We're just deleting the GitHub repository and creating a fresh one.

---

## Step 1: Delete Repository on GitHub

1. **Go to your repository:**
   - Visit: https://github.com/Tejaswini812/Electronics
   
2. **Go to Settings:**
   - Click on the "Settings" tab (right side of the navigation bar)
   
3. **Scroll to Danger Zone:**
   - Scroll down to the bottom of the Settings page
   - Find the "Danger Zone" section (red background)
   
4. **Delete Repository:**
   - Click "Delete this repository"
   - Type: `Tejaswini812/Electronics` to confirm
   - Click "I understand the consequences, delete this repository"
   - Enter your GitHub password to confirm

---

## Step 2: Create New Repository on GitHub

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - Or: Click the "+" icon → "New repository"

2. **Repository Settings:**
   - **Repository name:** `Electronics`
   - **Description:** (Optional) "Component Search System - MERN Stack"
   - **Visibility:** Public (or Private)
   - **⚠️ IMPORTANT:** DO NOT initialize with README, .gitignore, or license
   - **⚠️ DO NOT create any branches** - we'll push from local

3. **Create Repository:**
   - Click "Create repository"

---

## Step 3: Push to New Repository (Master Branch Only)

After creating the new repository, run these commands:

### Commands to Run:

```bash
# 1. Make sure you're in the project directory
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project

# 2. Remove old remote (if exists)
git remote remove origin

# 3. Add new remote
git remote add origin https://github.com/Tejaswini812/Electronics.git

# 4. Make sure you're on master branch
git branch -M master

# 5. Push to new repository (master branch only)
git push -u origin master
```

---

## Step 4: Verify

1. **Check GitHub:**
   - Visit: https://github.com/Tejaswini812/Electronics
   - You should see only the `master` branch
   - All 30 files should be there

2. **Verify Branch:**
   - Only `master` branch should exist
   - No `main` branch

---

## ✅ Success Checklist

- [ ] Old repository deleted
- [ ] New repository created (no branches initialized)
- [ ] Old remote removed
- [ ] New remote added
- [ ] Pushed to master branch
- [ ] Only master branch exists on GitHub
- [ ] All 30 files are on GitHub

---

## 🚨 If You Need Help

If you get stuck, run these commands one by one:

```bash
# Check current directory
cd C:\Users\hp\OneDrive\Desktop\electronic\my-web-project

# Check git status
git status

# Check remote
git remote -v

# Remove remote if needed
git remote remove origin

# Add new remote
git remote add origin https://github.com/Tejaswini812/Electronics.git

# Verify branch
git branch

# Push to master
git push -u origin master
```

---

## 📋 Alternative: Keep Repository, Just Set Master as Default

If you don't want to delete the repository, you can:

1. **Go to Settings** → **Branches**
2. **Change default branch** from `main` to `master`
3. **Delete main branch** after changing default
4. **Push master** as the only branch

But the cleanest solution is to delete and recreate as described above.

---

**Ready to proceed? Follow the steps above!**

