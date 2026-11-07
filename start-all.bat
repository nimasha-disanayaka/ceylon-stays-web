@echo off
TITLE CeylonStays Launcher
COLOR 0A

echo ===================================================================
echo               LAUNCHING CEYLONSTAYS ECOSYSTEM
echo ===================================================================
echo.

echo [1/3] Starting Backend API Server (Port 5000)...
start "CeylonStays Backend [Port 5000]" cmd /k "cd /d %~dp0..\booking-platform-backend && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo [2/3] Starting Owner Web Portal (Port 3000)...
start "CeylonStays Web Portal [Port 3000]" cmd /k "cd /d %~dp0 && npm run dev"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Starting Traveler Mobile App (Port 8081)...
start "CeylonStays Mobile App [Port 8081]" cmd /k "cd /d %~dp0..\booking-platform-mobile && npx expo start"

echo.
echo ===================================================================
echo      ALL 3 APPLICATIONS ARE NOW RUNNING IN SEPARATE TERMINALS!
echo ===================================================================
echo  - Backend API:       http://localhost:5000
echo  - Owner Dashboard:   http://localhost:3000
echo  - Mobile App Web:    http://localhost:8081 (Press 'w' in Mobile Terminal)
echo ===================================================================
echo.
