@echo off
setlocal enabledelayedexpansion

REM Start all Node.js mock services
set "MOCK_SERVICES_DIR=%~dp0mock-services"
set "MOCK_SERVICES=mock-bank-service mock-payment-gateway mock-provisioning-gateway"

echo Starting all mock services...
for %%s in (%MOCK_SERVICES%) do (
    set "SERVICE_PATH=!MOCK_SERVICES_DIR!\%%s"

    if exist "!SERVICE_PATH!\package.json" (
        echo Starting %%s...
        
        REM 1. Install dependencies (use CALL to prevent script exit)
        pushd "!SERVICE_PATH!"
        call npm install >nul 2>&1
        popd

        REM 2. Start service in new window using /D to force correct directory
        start "Mock Service: %%s" /D "!SERVICE_PATH!" cmd /k "npm start"
        
        echo %%s started
    ) else (
        echo Warning: %%s or package.json not found at !SERVICE_PATH!
    )
)
echo All mock services have been started.

REM Start all Node.js services
set "SERVICES_DIR=%~dp0services"
set "SERVICES=billing-service chat-service mock-telco-core notification-service payment-service provisioning-service user-service"

echo Starting all services...
for %%s in (%SERVICES%) do (
    set "SERVICE_PATH=!SERVICES_DIR!\%%s"
    
    if exist "!SERVICE_PATH!\package.json" (
        echo Starting %%s...
        
        REM 1. Install dependencies
        pushd "!SERVICE_PATH!"
        call npm install >nul 2>&1
        popd

        REM 2. Start service in new window
        start "Service: %%s" /D "!SERVICE_PATH!" cmd /k "npm start"
        
        echo %%s started
    ) else (
        echo Warning: %%s or package.json not found at !SERVICE_PATH!
    )
)
echo All services have been started.

REM starting gateway
echo Starting gateway...
cd /d "%~dp0api-gateway"
call npm install >nul 2>&1
start "API Gateway" /D "%~dp0api-gateway" cmd /k "npm start"
echo Gateway started

pause