@echo off
echo ========================================
echo Starting Frontend Server...
echo ========================================
cd /d "%~dp0\frontend"
call npm start
pause
