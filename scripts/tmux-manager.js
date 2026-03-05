/**
 * TmuxManager - tmux 状态面板管理器
 * 在 WSL 中自动启动状态显示面板
 */

const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TmuxManager = {
  statusProcess: null,
  isWindows: process.platform === 'win32',

  /**
   * 启动 tmux 状态面板
   * @param {string} task - 任务描述
   */
  async startStatusPanel(task) {
    const scriptDir = this._getScriptDir();
    const statusScript = path.join(scriptDir, 'ulw-status.sh');

    // 确保脚本存在
    if (!fs.existsSync(statusScript)) {
      console.log('[TmuxManager] 状态脚本不存在，跳过面板启动');
      return false;
    }

    // 修复脚本行尾符
    try {
      execSync(`wsl bash -c "sed -i 's/\\r$//' '${this._toWslPath(statusScript)}' && chmod +x '${this._toWslPath(statusScript)}'"`);
    } catch (e) {
      // 忽略
    }

    // 初始化状态文件
    this._initStateFile(task);

    if (this.isWindows) {
      return await this._openStatusWindow();
    } else {
      return await this._startInTmux(statusScript, task);
    }
  },

  /**
   * 打开状态窗口（直接在新窗口显示状态面板）
   */
  async _openStatusWindow() {
    return new Promise((resolve) => {
      try {
        // 使用 ASCII 版本脚本（兼容 Windows CMD）
        const wslScript = '/mnt/d/his/ultrawork-skill/scripts/ulw-status-ascii.sh';

        this._openWithCmd(wslScript, resolve);
      } catch (e) {
        console.log('[TmuxManager] 打开状态窗口失败:', e.message);
        resolve(false);
      }
    });
  },

  /**
   * 使用 PowerShell 打开状态窗口（支持中文）
   */
  _openWithCmd(wslScript, resolve) {
    // 创建一个 VBS 脚本来启动带有正确字体的控制台窗口
    const vbsScript = `Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get temp path
strTemp = objShell.ExpandEnvironmentStrings("%TEMP%")
strBatFile = strTemp & "\\ulw-status-panel.bat"

' Set console font via registry BEFORE launching
' This is the key - set registry values before launching cmd
On Error Resume Next
objShell.RegWrite "HKCU\\Console\\FaceName", "FangSong", "REG_SZ"
objShell.RegWrite "HKCU\\Console\\CodePage", 65001, "REG_DWORD"
objShell.RegWrite "HKCU\\Console\\FontSize", 1310720, "REG_DWORD"
objShell.RegWrite "HKCU\\Console\\FontFamily", 54, "REG_DWORD"
objShell.RegWrite "HKCU\\Console\\FontWeight", 400, "REG_DWORD"
On Error Goto 0

' Create batch file with ANSI encoding (not Unicode, so CMD can read it)
Set objFile = objFSO.CreateTextFile(strBatFile, True, False)  ' False = ANSI
objFile.WriteLine "@echo off"
objFile.WriteLine "chcp 65001 >nul 2>&1"
objFile.WriteLine "mode con cols=50 lines=22"
objFile.WriteLine "title UltraWork Status Panel"
objFile.WriteLine "wsl -e bash -c ""sed -i 's/\\r$//' ${wslScript} 2>/dev/null; chmod +x ${wslScript} 2>/dev/null; ULW_SIMPLE_TERM=1 exec ${wslScript} panel"""
objFile.WriteLine "if errorlevel 1 ("
objFile.WriteLine "    echo [Error] Status panel failed to start"
objFile.WriteLine "    pause"
objFile.WriteLine ")"
objFile.Close

' Launch the batch file in a new window
objShell.Run "cmd /k " & Chr(34) & strBatFile & Chr(34), 1, False
`;
    const tempVbs = require('os').tmpdir() + '\\ulw-status-panel.vbs';
    require('fs').writeFileSync(tempVbs, vbsScript, 'utf8');

    // 使用 cscript 运行 VBS 脚本
    const child = spawn('cscript', [
      '//Nologo',
      tempVbs
    ], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });

    child.on('error', (err) => {
      console.log('[TmuxManager] Failed:', err.message);
      resolve(false);
    });

    child.unref();
    console.log('[TmuxManager] Status panel opened with FangSong font');
    resolve(true);
  },

  /**
   * 在 tmux 中启动（从 Linux/WSL 内部调用）
   */
  async _startInTmux(scriptPath, task) {
    return new Promise((resolve) => {
      const inTmux = process.env.TMUX;

      if (inTmux) {
        // 已在 tmux 中
        console.log('[TmuxManager] 创建状态面板...');
        exec(`tmux split-window -h -p 30 '${scriptPath} panel'`, (err) => {
          resolve(!err);
        });
      } else {
        // 不在 tmux 中，直接运行
        spawn('bash', ['-c', `${scriptPath} panel`], {
          detached: true,
          stdio: 'ignore'
        });
        resolve(true);
      }
    });
  },

  /**
   * 停止状态面板
   */
  stopStatusPanel() {
    if (this.statusProcess) {
      this.statusProcess.kill();
      this.statusProcess = null;
    }
  },

  /**
   * 获取脚本目录
   */
  _getScriptDir() {
    return path.join(__dirname);
  },

  /**
   * Windows 路径转 WSL 路径
   */
  _toWslPath(winPath) {
    return winPath
      .replace(/\\/g, '/')
      .replace(/^([A-Za-z]):/, (_, letter) => `/mnt/${letter.toLowerCase()}`);
  },

  /**
   * 初始化状态文件
   */
  _initStateFile(task) {
    try {
      const wslStateFile = '/tmp/ultrawork-state.json';
      const state = {
        task: task,
        progress: 0,
        agents: {},
        status: 'running',
        updatedAt: new Date().toISOString()
      };

      // 使用 base64 编码写入
      if (this.isWindows) {
        const base64Content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
        execSync(`wsl bash -c "echo '${base64Content}' | base64 -d > ${wslStateFile}"`);
      } else {
        fs.writeFileSync(wslStateFile, JSON.stringify(state, null, 2));
      }
    } catch (e) {
      console.log('[TmuxManager] 初始化状态文件失败:', e.message);
    }
  }
};

module.exports = TmuxManager;