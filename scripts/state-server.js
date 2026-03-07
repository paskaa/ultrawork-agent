/**
 * State Server - Web-based status viewer
 * Provides a simple HTTP server for status monitoring
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '..', '.ultrawork', 'state.json');
const PORT = 3456;

// Ensure state directory exists
const stateDir = path.dirname(STATE_FILE);
if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
}

// Default state
let currentState = {
    task: 'Waiting for task...',
    progress: 0,
    status: 'idle',
    agents: [],
    logs: [],
    lastUpdate: new Date().toISOString()
};

// Load state from file if exists
if (fs.existsSync(STATE_FILE)) {
    try {
        currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
        // Ignore parse errors
    }
}

// HTTP Server
const server = http.createServer((req, res) => {
    if (req.url === '/state.json') {
        // API endpoint - return current state
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentState, null, 2));
    } else if (req.url === '/update') {
        // Update state via POST
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const newState = JSON.parse(body);
                    currentState = { ...currentState, ...newState, lastUpdate: new Date().toISOString() };
                    fs.writeFileSync(STATE_FILE, JSON.stringify(currentState, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
        } else {
            res.writeHead(405);
            res.end('Method not allowed');
        }
    } else {
        // HTML page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(generateHTML());
    }
});

function generateHTML() {
    const statusColor = {
        'idle': '#6b7280',
        'running': '#3b82f6',
        'completed': '#10b981',
        'failed': '#ef4444'
    }[currentState.status] || '#6b7280';

    return `<!DOCTYPE html>
<html>
<head>
    <title>UltraWork Status</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 400px; margin: 0 auto; }
        .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #334155;
        }
        .header h1 { font-size: 24px; margin-bottom: 8px; }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .task-card {
            background: #1e293b;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        .task-label { color: #94a3b8; font-size: 12px; margin-bottom: 4px; }
        .task-text { font-size: 16px; font-weight: 500; }
        .progress-bar {
            height: 8px;
            background: #334155;
            border-radius: 4px;
            margin-top: 12px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: width 0.3s ease;
        }
        .progress-text {
            text-align: right;
            margin-top: 4px;
            font-size: 14px;
            color: #94a3b8;
        }
        .agent-card {
            background: #1e293b;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .agent-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .agent-name { flex: 1; font-weight: 500; }
        .agent-task { color: #94a3b8; font-size: 12px; }
        .log-section {
            background: #1e293b;
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
        }
        .log-entry {
            font-family: monospace;
            font-size: 12px;
            padding: 4px 0;
            border-bottom: 1px solid #334155;
        }
        .log-time { color: #64748b; margin-right: 8px; }
        .refresh-hint {
            text-align: center;
            margin-top: 16px;
            font-size: 11px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏰 UltraWork</h1>
            <span class="status-badge" style="background: ${statusColor}">${currentState.status}</span>
        </div>

        <div class="task-card">
            <div class="task-label">Current Task</div>
            <div class="task-text">${currentState.task}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${currentState.progress}%"></div>
            </div>
            <div class="progress-text">${currentState.progress}% complete</div>
        </div>

        ${(currentState.agents || []).map(agent => `
        <div class="agent-card">
            <div class="agent-status" style="background: ${agent.status === 'OK' ? '#10b981' : agent.status === 'RUN' ? '#3b82f6' : '#6b7280'}"></div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-task">${agent.task || 'waiting'}</div>
        </div>
        `).join('')}

        <div class="log-section">
            ${(currentState.logs || []).slice(-5).map(log => `
            <div class="log-entry">
                <span class="log-time">${log.time}</span>
                ${log.message}
            </div>
            `).join('')}
        </div>

        <div class="refresh-hint">Auto-refresh every 2s</div>
    </div>

    <script>
        setTimeout(() => location.reload(), 2000);
    </script>
</body>
</html>`;
}

// Start server
server.listen(PORT, () => {
    console.log(`
+==========================================+
|  UltraWork State Server                  |
+==========================================+
|  Status: Running                          |
|  URL: http://localhost:${PORT}             |
|  API: http://localhost:${PORT}/state.json  |
+==========================================+

Press Ctrl+C to stop
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close();
    process.exit(0);
});

module.exports = { server, getState: () => currentState, setState: (s) => { currentState = s; } };