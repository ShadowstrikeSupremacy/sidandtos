@echo off
echo Installing Sidandtos dependencies...
echo.

echo Installing server dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Server installation failed!
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Client installation failed!
    pause
    exit /b 1
)

cd ..
echo.
echo Installation complete!
echo.
echo To start the application, run: start.bat
echo Or manually run: npm run dev
pause
