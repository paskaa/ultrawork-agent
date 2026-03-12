@echo off
chcp 65001 >nul
:: UltraWork Panel Auto-Start
:: 此脚本用于 Windows 开机自动启动或手动启动面板服务

echo ============================================
echo    UltraWork Web Panel 启动脚本
echo ============================================
echo.

:: 检查是否已经在运行
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq node*" 2>nul | find "node.exe" >nul
if %ERRORLEVEL% == 0 (
    echo [INFO] 面板服务已经在运行中
    echo [INFO] 访问 http://localhost:3459
    echo.
    choice /C YN /M "是否重新启动"
    if errorlevel 2 goto :EOF
    taskkill /F /IM node.exe 2>nul
    timeout /t 2 /nobreak >nul
)

:: 设置工作目录
cd /d "%~dp0\..\scripts"

:: 检查文件是否存在
if not exist "state-server-v5.cjs" (
    echo [ERROR] 找不到 state-server-v5.cjs
    echo [ERROR] 请检查安装路径
    pause
    exit /b 1
)

:: 启动服务
echo [INFO] 正在启动 UltraWork Web Panel...
echo [INFO] 端口: 3459
echo [INFO] 访问地址: http://localhost:3459
echo.

start "UltraWork Panel" /min node state-server-v5.cjs

:: 等待启动
timeout /t 3 /nobreak >nul

:: 检查是否成功启动
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find "node.exe" >nul
if %ERRORLEVEL% == 0 (
    echo [SUCCESS] 面板服务已启动！
    echo [SUCCESS] 访问: http://localhost:3459
    echo.
    echo 按任意键在浏览器中打开...
    pause >nul
    start http://localhost:3459
) else (
    echo [ERROR] 启动失败
    pause
)
