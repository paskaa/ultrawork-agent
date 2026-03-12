# UltraWork 三国军团启动脚本 (PowerShell)
# 使用方法：右键选择"使用 PowerShell 运行"

param(
    [int]$Port = 3459
)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         UltraWork 三国军团 V3 - 45人版启动器                ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  正在启动 Web 调度面板服务器...                               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:ULTRAWORK_PORT = $Port

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $ScriptDir "state-server-v3.js"

Write-Host "📁 服务器路径: $ServerPath" -ForegroundColor Gray
Write-Host "🚪 端口: $Port" -ForegroundColor Gray
Write-Host ""

# 检查文件是否存在
if (-not (Test-Path $ServerPath)) {
    Write-Host "❌ 错误: 找不到服务器文件" -ForegroundColor Red
    Write-Host "   $ServerPath" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 检查 Node.js
try {
    $NodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $NodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host ""
Write-Host "🚀 正在启动服务器..." -ForegroundColor Yellow

# 启动服务器（在新窗口中）
$NodeProcess = Start-Process -FilePath "node" -ArgumentList $ServerPath -PassThru -WindowStyle Minimized

# 等待服务器启动
Write-Host "⏳ 等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 检查是否成功启动
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:$Port/api/status" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host ""
    Write-Host "✅ 服务器启动成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Web面板: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host "📊 API状态: http://localhost:$Port/api/status" -ForegroundColor Cyan
    Write-Host "🔌 WebSocket: ws://localhost:$Port/ws" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "请点击上面的链接访问面板，或复制到浏览器打开" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "服务器正在后台运行 (PID: $($NodeProcess.Id))" -ForegroundColor Gray
    Write-Host "关闭此窗口不会停止服务器" -ForegroundColor Gray
    Write-Host ""
    
    # 打开浏览器
    $OpenBrowser = Read-Host "是否打开浏览器? (Y/N)"
    if ($OpenBrowser -eq "Y" -or $OpenBrowser -eq "y") {
        Start-Process "http://localhost:$Port"
    }
    
} catch {
    Write-Host ""
    Write-Host "⚠️  警告: 服务器可能未正常启动" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "提示: 若要停止服务器，请运行:" -ForegroundColor Gray
Write-Host "   taskkill /F /IM node.exe" -ForegroundColor Gray
Write-Host ""
Read-Host "按 Enter 关闭此窗口"
