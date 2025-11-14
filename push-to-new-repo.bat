@echo off
echo ========================================
echo Pushing to New GitHub Repository
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Removing old remote...
git remote remove origin

echo.
echo Step 2: Adding new remote...
git remote add origin https://github.com/Tejaswini812/Electronics.git

echo.
echo Step 3: Setting branch to master...
git branch -M master

echo.
echo Step 4: Pushing to GitHub (master branch)...
git push -u origin master

echo.
echo ========================================
echo Done! Check GitHub: https://github.com/Tejaswini812/Electronics
echo ========================================
pause

