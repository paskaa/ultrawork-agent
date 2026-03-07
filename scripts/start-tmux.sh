#!/bin/bash

# UltraWork tmux Layout Script
# Creates a split view: Claude Code on left, Status bar on right

SESSION_NAME="ultrawork"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if session exists
tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Session '$SESSION_NAME' already exists. Attaching..."
    tmux attach -t $SESSION_NAME
    exit 0
fi

echo "Creating new tmux session: $SESSION_NAME"

# Create new session with main window
tmux new-session -d -s $SESSION_NAME -x 160 -y 40

# Split window vertically (right 30%)
tmux split-window -h -p 30 -t $SESSION_NAME

# Left pane (0): Instructions for Claude Code
tmux send-keys -t $SESSION_NAME:0.0 'echo "=== Claude Code Pane ===" && echo "Run: claude" && echo ""' Enter

# Right pane (1): Status Bar
tmux send-keys -t $SESSION_NAME:0.1 "echo '=== UltraWork Status Bar ===' && echo 'Starting...' && node $PROJECT_ROOT/scripts/fixed-status-bar.js" Enter

# Set pane titles
tmux select-pane -t $SESSION_NAME:0.0 -T "Claude Code"
tmux select-pane -t $SESSION_NAME:0.1 -T "Status Bar"

# Set base index to 1
tmux set-option -g base-index 1

# Enable mouse support
tmux set-option -g mouse on

echo ""
echo "Session created! Run the following command to attach:"
echo "  tmux attach -t $SESSION_NAME"
echo ""
echo "Or run directly:"
tmux attach -t $SESSION_NAME