@echo off
echo Killing all Node.js processes and ports...
taskkill /F /IM node.exe >nul 2>&1
echo Done! All Node.js processes killed.
pause

