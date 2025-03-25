@echo off 
echo Quality Re-Org Platform Launcher 
echo ======================================= 
echo. 
echo 1. Launch Full Application 
echo 2. Launch Basic Mode 
echo 3. Launch Diagnostics 
echo. 
set /p choice=Enter choice (1-3): 
 
if "%choice%"=="1" start index.html 
if "%choice%"=="2" start basic.html 
if "%choice%"=="3" start diagnose.html 
 
pause 
