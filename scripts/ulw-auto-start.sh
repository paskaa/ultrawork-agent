#!/bin/bash
# UltraWork 自动启动器
# 自动创建 tmux 会话并分割面板显示状态
# 用法: ./ulw-auto-start.sh "任务描述"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUS_SCRIPT="$SCRIPT_DIR/ulw-status.sh"
STATE_FILE="/tmp/ultrawork-state.json"

# 颜色
RED='\033[31m'
GREEN='\033[32m'
CYAN='\033[36m'
BOLD='\033[1m'
RESET='\033[0m'

# 检查依赖
check_deps() {
    local missing=()
    command -v tmux &>/dev/null || missing+=("tmux")
    command -v jq &>/dev/null || missing+=("jq")

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}缺少依赖: ${missing[*]}${RESET}"
        echo "请安装: sudo apt-get install -y ${missing[*]}"
        exit 1
    fi
}

# 初始化状态文件
init_state() {
    echo '{
        "task": "'"$1"'",
        "progress": 0,
        "agents": {},
        "status": "running",
        "updatedAt": "'$(date -Iseconds)'"
    }' > "$STATE_FILE"
}

# 启动 tmux 会话和状态面板
start_tmux_session() {
    local task="$1"
    local session_name="ultrawork"

    # 如果已在 tmux 中
    if [ -n "$TMUX" ]; then
        echo -e "${CYAN}已在 tmux 会话中，创建状态面板...${RESET}"
        # 关闭可能存在的旧状态面板
        tmux kill-pane -t :.+1 2>/dev/null || true
        # 创建新的状态面板
        tmux split-window -h -p 30 "$STATUS_SCRIPT panel"
        return
    fi

    # 检查是否已有会话
    if tmux has-session -t $session_name 2>/dev/null; then
        echo -e "${CYAN}已有 ultrawork 会话，附加到会话...${RESET}"
        tmux attach-session -t $session_name
        return
    fi

    echo -e "${GREEN}创建新的 tmux 会话: $session_name${RESET}"

    # 创建新会话，主窗口运行状态面板
    tmux new-session -d -s $session_name -x 160 -y 40

    # 分割窗口: 左侧 70% 用于任务，右侧 30% 用于状态
    tmux split-window -h -p 30 -t $session_name "$STATUS_SCRIPT panel"

    # 设置主面板（左侧）
    tmux select-pane -t $session_name:0.0

    # 附加到会话
    tmux attach-session -t $session_name
}

# 主流程
main() {
    local task="${1:-UltraWork 任务}"

    echo -e "${BOLD}🏰 UltraWork 自动启动器${RESET}"
    echo ""

    # 检查依赖
    check_deps

    # 初始化状态
    init_state "$task"

    echo -e "军令: ${CYAN}$task${RESET}"
    echo ""

    # 启动 tmux
    start_tmux_session "$task"
}

main "$@"