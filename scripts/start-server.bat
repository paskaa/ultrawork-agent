@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            UltraWork 三国军团 V3 - 45人版                     ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  启动Web调度面板服务器...                                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 设置环境变量
set ULTRAWORK_PORT=3459

REM 启动状态服务器（修复路径问题）
cd /d "%~dp0"
start /min cmd /c "node state-server-v3.js"

REM 等待服务器启动
timeout /t 2 /nobreak >nul

echo ✅ 状态服务器已启动
echo 🌐 Web面板: http://localhost:3459
echo.
echo 按任意键停止服务器...
pause >nul

REM 停止服务器
taskkill /F /IM node.exe >nul 2>&1
echo.
echo 服务器已停止
echo.
