#!/bin/bash
# UltraWork 状态监视器 - 在 tmux 面板中实时显示状态
# 用法: ./ulw-status.sh [watch|panel|split]

STATE_FILE="/tmp/ultrawork-state.json"
LOG_FILE="/tmp/ultrawork-log.txt"

# 颜色定义
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
CYAN='\033[36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# 显示帮助
show_help() {
    echo "UltraWork 状态监视器"
    echo ""
    echo "用法:"
    echo "  $0 watch     - 实时监视状态（当前面板）"
    echo "  $0 panel     - 在 tmux 右侧面板显示状态"
    echo "  $0 split     - 创建上下分割的面板"
    echo "  $0 status    - 显示当前状态（一次性）"
    echo "  $0 logs      - 显示日志"
    echo "  $0 clear     - 清除状态文件"
    echo ""
    echo "在 tmux 中推荐使用: $0 panel"
}

# 初始化状态文件
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        echo '{"task":"","progress":0,"agents":{},"status":"idle","updatedAt":""}' > "$STATE_FILE"
    fi
}

# 读取状态
read_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo '{"task":"","progress":0,"agents":{},"status":"idle","updatedAt":""}'
    fi
}

# 绘制进度条
draw_progress() {
    local percent=$1
    local width=${2:-20}
    local filled=$((percent * width / 100))
    local empty=$((width - filled))

    printf "${CYAN}"
    printf '█%.0s' $(seq 1 $filled 2>/dev/null)
    printf "${DIM}"
    printf '░%.0s' $(seq 1 $empty 2>/dev/null)
    printf "${RESET}"
}

# 显示状态面板
show_panel() {
    clear
    echo -e "${BOLD}🏰 UltraWork 三国军团 状态面板${RESET}"
    echo "┌────────────────────────────────────────┐"

    # 读取状态
    local state=$(read_state)
    local task=$(echo "$state" | jq -r '.task // "待命中..."' 2>/dev/null || echo "待命中...")
    local progress=$(echo "$state" | jq -r '.progress // 0' 2>/dev/null || echo "0")
    local status=$(echo "$state" | jq -r '.status // "idle"' 2>/dev/null || echo "idle")
    local updatedAt=$(echo "$state" | jq -r '.updatedAt // ""' 2>/dev/null || echo "")

    # 状态图标
    local status_icon="⏸️"
    case $status in
        running) status_icon="🔄" ;;
        completed) status_icon="✅" ;;
        failed) status_icon="❌" ;;
    esac

    # 任务信息
    echo -e "│ ${CYAN}军令:${RESET} ${task:0:30}"
    echo "├────────────────────────────────────────┤"

    # 总进度
    echo -ne "│ ${BOLD}总进度${RESET} "
    draw_progress $progress 20
    echo " ${progress}%"
    echo "├────────────────────────────────────────┤"

    # Agent 状态
    echo -e "│ ${BOLD}🎖️  将领状态${RESET}"

    # 解析 agents
    if command -v jq &> /dev/null; then
        local agents=$(echo "$state" | jq -r '.agents | to_entries[] | "\(.key)|\(.value.name)|\(.value.status)|\(.value.progress)|\(.value.task)"' 2>/dev/null)
        if [ -n "$agents" ]; then
            while IFS='|' read -r id name agent_status agent_progress agent_task; do
                local icon="⏸️"
                case $agent_status in
                    running) icon="🔄" ;;
                    completed) icon="✅" ;;
                    failed) icon="❌" ;;
                esac
                echo -e "│ ${icon} ${name} $(draw_progress ${agent_progress:-0} 5) ${DIM}${agent_task:0:15}${RESET}"
            done <<< "$agents"
        else
            echo "│   ${DIM}暂无活动将领${RESET}"
        fi
    else
        echo "│   ${DIM}需要 jq 来解析状态${RESET}"
    fi

    echo "├────────────────────────────────────────┤"

    # 最近日志
    echo -e "│ ${BOLD}📜 执行日志${RESET}"
    if [ -f "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE" | while read -r line; do
            echo -e "│ ${DIM}${line:0:36}${RESET}"
        done
    else
        echo "│   ${DIM}暂无日志${RESET}"
    fi

    echo "└────────────────────────────────────────┘"
    echo -e "${DIM}更新时间: ${updatedAt:-N/A} | 按 Ctrl+C 退出${RESET}"
}

# 实时监视
watch_status() {
    init_state
    echo "正在监视 UltraWork 状态... (Ctrl+C 退出)"
    echo ""

    # 使用 watch 或循环
    if command -v watch &> /dev/null; then
        watch -n 1 -c "bash $0 status"
    else
        while true; do
            show_panel
            sleep 1
            # 移动光标到顶部
            printf "\033[${LINES:-24}A"
        done
    fi
}

# 在 tmux 面板中监视
panel_watch() {
    init_state

    # 不要求必须在 tmux 中，普通终端也可以运行
    while true; do
        show_panel
        sleep 1
        # 移动光标到顶部
        tput cup 0 0 2>/dev/null || printf "\033[${LINES:-24}A"
    done
}

# 创建 tmux 分割面板
create_split() {
    if [ -z "$TMUX" ]; then
        echo "错误: 需要在 tmux 会话中运行"
        echo "请先启动 tmux: tmux new-session"
        exit 1
    fi

    # 在右侧创建面板并运行状态监视
    tmux split-window -h -p 30 "bash $0 panel"
    echo "已在右侧创建状态面板"
}

# 显示日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "=== UltraWork 执行日志 ==="
        cat "$LOG_FILE"
    else
        echo "暂无日志文件: $LOG_FILE"
    fi
}

# 清除状态
clear_state() {
    rm -f "$STATE_FILE" "$LOG_FILE"
    echo "状态文件已清除"
}

# 主入口
case "${1:-help}" in
    watch) watch_status ;;
    panel) panel_watch ;;
    split) create_split ;;
    status) show_panel ;;
    logs) show_logs ;;
    clear) clear_state ;;
    help|--help|-h) show_help ;;
    *)
        echo "未知命令: $1"
        show_help
        exit 1
        ;;
esac