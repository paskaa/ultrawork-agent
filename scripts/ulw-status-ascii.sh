#!/bin/bash
# UltraWork Status Monitor - ASCII version for Windows CMD compatibility
# Usage: ./ulw-status-ascii.sh [watch|panel|split]

STATE_FILE="/tmp/ultrawork-state.json"
LOG_FILE="/tmp/ultrawork-log.txt"

# Detect terminal type for color support
detect_terminal() {
    # Force limited mode via environment variable
    if [[ "$ULW_SIMPLE_TERM" == "1" ]]; then
        echo "limited"
        return
    fi

    # Check if parent process is Windows CMD (via WSL interop)
    local parent_cmd=""
    if [[ -f /proc/$PPID/comm ]]; then
        parent_cmd=$(cat /proc/$PPID/comm 2>/dev/null | tr '[:upper:]' '[:lower:]')
    fi

    # Check for Windows console host or CMD
    if [[ "$parent_cmd" == *"cmd"* ]] || [[ "$parent_cmd" == *"conhost"* ]] || [[ "$parent_cmd" == *"wsl"* ]]; then
        # Check if we have a proper terminal emulator
        if [[ -z "$TMUX" ]] && [[ -z "$WT_SESSION" ]] && [[ "$TERM" != *"screen"* ]]; then
            echo "limited"
            return
        fi
    fi

    # Check for Windows Terminal or proper terminal emulators
    if [[ -n "$WT_SESSION" ]] || [[ "$TERM_PROGRAM" == "vscode" ]] || [[ -n "$TMUX" ]]; then
        echo "full"
        return
    fi

    # Default to limited for WSL without proper terminal
    if [[ -n "$WSL_DISTRO_NAME" ]] && [[ -z "$TMUX" ]]; then
        echo "limited"
        return
    fi

    echo "full"
}

TERMINAL_SUPPORT=$(detect_terminal)

# Colors (ANSI) - with fallback for limited terminals
if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
    RED='\033[31m'
    GREEN='\033[32m'
    YELLOW='\033[33m'
    BLUE='\033[34m'
    CYAN='\033[36m'
    BOLD='\033[1m'
    DIM='\033[2m'
    RESET='\033[0m'
else
    # Limited terminal (Windows CMD) - skip DIM and use simpler colors
    RED='\033[31m'
    GREEN='\033[32m'
    YELLOW='\033[33m'
    BLUE='\033[34m'
    CYAN='\033[36m'
    BOLD='\033[1m'
    DIM=''  # No DIM in limited terminals
    RESET='\033[0m'
fi

# Show help
show_help() {
    echo "UltraWork Status Monitor"
    echo ""
    echo "Usage:"
    echo "  $0 watch     - Watch status in current panel"
    echo "  $0 panel     - Display status panel (continuous)"
    echo "  $0 split     - Create split panel in tmux"
    echo "  $0 status    - Show current status (once)"
    echo "  $0 logs      - Show logs"
    echo "  $0 clear     - Clear status files"
}

# Init state file
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        echo '{"task":"","progress":0,"agents":{},"status":"idle","updatedAt":""}' > "$STATE_FILE"
    fi
}

# Read state
read_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo '{"task":"","progress":0,"agents":{},"status":"idle","updatedAt":""}'
    fi
}

# Draw progress bar
draw_progress() {
    local percent=$1
    local width=${2:-20}
    local filled=$((percent * width / 100))
    local empty=$((width - filled))

    # Ensure non-negative values
    [ $filled -lt 0 ] && filled=0
    [ $empty -lt 0 ] && empty=0

    printf "${CYAN}"
    if [ $filled -gt 0 ]; then
        printf '#%.0s' $(seq 1 $filled 2>/dev/null)
    fi
    # Use simple dash for empty in limited terminals
    if [ $empty -gt 0 ]; then
        printf "${DIM}"
        printf -- '-%.0s' $(seq 1 $empty 2>/dev/null)
        printf "${RESET}"
    fi
}

# Show status panel
show_panel() {
    clear
    echo -e "${BOLD}+------------------------------------------+${RESET}"
    echo -e "${BOLD}|  UltraWork Legion - Status Panel         |${RESET}"
    echo -e "${BOLD}+------------------------------------------+${RESET}"

    # Read state
    local state=$(read_state)
    local task=$(echo "$state" | jq -r '.task // "Waiting..."' 2>/dev/null || echo "Waiting...")
    local progress=$(echo "$state" | jq -r '.progress // 0' 2>/dev/null || echo "0")
    local status=$(echo "$state" | jq -r '.status // "idle"' 2>/dev/null || echo "idle")
    local updatedAt=$(echo "$state" | jq -r '.updatedAt // ""' 2>/dev/null || echo "")

    # Status icon
    local status_icon="[ ]"
    case $status in
        running) status_icon="[>]" ;;
        completed) status_icon="[OK]" ;;
        failed) status_icon="[X]" ;;
    esac

    # Task info
    echo -e "| ${CYAN}Task:${RESET} ${task:0:32}"
    echo -e "+------------------------------------------+"

    # Total progress
    echo -ne "| ${BOLD}Progress:${RESET} "
    draw_progress $progress 20
    echo " ${progress}%"
    echo -e "+------------------------------------------+"

    # Agent status
    echo -e "| ${BOLD}Agents:${RESET}"

    # Parse agents
    if command -v jq &> /dev/null; then
        local agents=$(echo "$state" | jq -r '.agents | to_entries[] | "\(.key)|\(.value.name)|\(.value.status)|\(.value.progress)|\(.value.task)"' 2>/dev/null)
        if [ -n "$agents" ]; then
            while IFS='|' read -r id name agent_status agent_progress agent_task; do
                local icon="[ ]"
                case $agent_status in
                    running) icon="[>]" ;;
                    completed) icon="[OK]" ;;
                    failed) icon="[X]" ;;
                esac
                # Use brackets for dimmed text in limited terminals
                if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
                    echo -e "| ${icon} ${name} $(draw_progress ${agent_progress:-0} 5) ${DIM}${agent_task:0:15}${RESET}"
                else
                    echo -e "| ${icon} ${name} $(draw_progress ${agent_progress:-0} 5) (${agent_task:0:12})"
                fi
            done <<< "$agents"
        else
            if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
                echo "|   ${DIM}No active agents${RESET}"
            else
                echo "|   (No active agents)"
            fi
        fi
    else
        if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
            echo "|   ${DIM}jq required for parsing${RESET}"
        else
            echo "|   (jq required for parsing)"
        fi
    fi

    echo -e "+------------------------------------------+"

    # Recent logs
    echo -e "| ${BOLD}Recent Logs:${RESET}"
    if [ -f "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE" | while read -r line; do
            if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
                echo -e "| ${DIM}${line:0:38}${RESET}"
            else
                echo "| (${line:0:35})"
            fi
        done
    else
        if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
            echo "|   ${DIM}No logs yet${RESET}"
        else
            echo "|   (No logs yet)"
        fi
    fi

    echo -e "+------------------------------------------+"
    if [[ "$TERMINAL_SUPPORT" == "full" ]]; then
        echo -e "${DIM}Updated: ${updatedAt:-N/A} | Press Ctrl+C to exit${RESET}"
    else
        echo "Updated: ${updatedAt:-N/A} | Press Ctrl+C to exit"
    fi
}

# Watch status
watch_status() {
    init_state
    echo "Watching UltraWork status... (Ctrl+C to exit)"
    echo ""

    if command -v watch &> /dev/null; then
        watch -n 1 -c "bash $0 status"
    else
        while true; do
            show_panel
            sleep 1
            printf "\033[${LINES:-24}A"
        done
    fi
}

# Panel watch (continuous)
panel_watch() {
    init_state

    while true; do
        show_panel
        sleep 1
        tput cup 0 0 2>/dev/null || printf "\033[${LINES:-24}A"
    done
}

# Create tmux split
create_split() {
    if [ -z "$TMUX" ]; then
        echo "Error: Must run inside tmux session"
        echo "Start tmux first: tmux new-session"
        exit 1
    fi

    tmux split-window -h -p 30 "bash $0 panel"
    echo "Status panel created on the right"
}

# Show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "=== UltraWork Execution Logs ==="
        cat "$LOG_FILE"
    else
        echo "No log file: $LOG_FILE"
    fi
}

# Clear state
clear_state() {
    rm -f "$STATE_FILE" "$LOG_FILE"
    echo "State files cleared"
}

# Main entry
case "${1:-help}" in
    watch) watch_status ;;
    panel) panel_watch ;;
    split) create_split ;;
    status) show_panel ;;
    logs) show_logs ;;
    clear) clear_state ;;
    help|--help|-h) show_help ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac