# UltraWork Status Bar - Implementation Options

## Option 1: Appended Status Bar (Current)

**How it works:**
- Status bar is appended at the end of each output
- Uses pure ASCII characters for alignment
- Multiple styles available

**Pros:**
- Works inside Claude Code
- No external dependencies
- Always visible (though scrolls)

**Cons:**
- Not fixed position - scrolls with content
- Can't control terminal cursor

## Option 2: External TUI Process (blessed)

**How it works:**
- Run a separate Node.js process using blessed library
- Creates a real TUI panel fixed on the right side
- Communicates via file/IPC with main process

**Implementation:**
```bash
# Terminal 1: Claude Code
claude

# Terminal 2: Status Bar (or tmux split)
node ultrawork-skill/scripts/fixed-status-bar.js
```

**Pros:**
- True fixed position
- Real-time updates
- Full terminal control

**Cons:**
- Requires separate terminal/process
- Not integrated with Claude Code

## Option 3: tmux Split Layout

**How it works:**
- Use tmux to split terminal into two panes
- Left pane: Claude Code
- Right pane: Status bar (fixed)

**Implementation:**
```bash
# Create layout
tmux new-session -s ultrawork -d
tmux split-window -h -p 30
tmux send-keys -t 0 'claude' Enter
tmux send-keys -t 1 'node ultrawork-skill/scripts/fixed-status-bar.js' Enter
tmux attach -t ultrawork
```

**Pros:**
- True split view
- Status bar always visible
- Works with any CLI tool

**Cons:**
- Requires tmux
- More setup required

## Option 4: Shared State File

**How it works:**
- Claude Code writes state to a file
- External process reads and displays
- Can use any viewer (terminal, web, GUI)

**Implementation:**
```
.ultrawork/
├── state.json     # Current state
├── status.html    # Web viewer
└── logs/          # History
```

**Pros:**
- Decoupled display
- Can use web browser for status
- Persistent history

**Cons:**
- Not real-time (polling needed)
- Additional viewer needed

## Recommendation

| Scenario | Recommended Option |
|----------|-------------------|
| Inside Claude Code | Option 1 (Appended) |
| External terminal | Option 2 (blessed) |
| tmux user | Option 3 (tmux split) |
| Web monitoring | Option 4 (Shared file) |

## Quick Start

### Option 1 (Default)
Just use `/ulw` command - status bar appears at output end.

### Option 2 (External TUI)
```bash
node D:/his/ultrawork-skill/scripts/fixed-status-bar.js
```

### Option 3 (tmux)
```bash
# Run from project root
./ultrawork-skill/scripts/start-tmux.sh
```

### Option 4 (Web)
```bash
# Start state server
node D:/his/ultrawork-skill/scripts/state-server.js

# Open browser
# http://localhost:3456/status
```