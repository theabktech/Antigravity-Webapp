// Antigravity Desktop Bridge Host Server
// Connects your local Antigravity environment to your phone PWA / Native APK

const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const os = require('os');
const { exec, spawn } = require('child_process');

const PORT = process.env.PORT || 4200;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'agy_sec_token_99a8';

// Find the best local Wi-Fi / LAN network IP (ignoring VirtualBox and WSL)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;
        const lowerName = name.toLowerCase();

        // Higher priority for Wi-Fi and common local home router subnets
        let priority = 1;
        if (lowerName.includes('wi-fi') || lowerName.includes('wlan') || lowerName.includes('wireless')) {
          priority = 10;
        } else if (ip.startsWith('192.168.0.') || ip.startsWith('192.168.1.')) {
          priority = 8;
        } else if (ip.startsWith('10.') || ip.startsWith('192.168.')) {
          priority = 5;
        } else if (ip.startsWith('192.168.56.') || ip.startsWith('172.')) {
          // VirtualBox / WSL / Docker virtual network
          priority = 0;
        }

        candidates.push({ name, ip, priority });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.length > 0 ? candidates[0].ip : '127.0.0.1';
}

const localIP = getLocalIP();
const localBridgeUrl = `ws://${localIP}:${PORT}`;
const httpUrl = `http://${localIP}:${PORT}`;

// Create HTTP server for health checks & pairing info
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.url === '/api/pair-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hostName: os.hostname(),
      platform: os.platform(),
      bridgeUrl: localBridgeUrl,
      token: AUTH_TOKEN,
      version: '2.0.0'
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>Antigravity Mobile Bridge</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #090b10; color: #e0e7ff; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #131722; border: 1px solid #2a324b; border-radius: 16px; padding: 32px; max-width: 420px; box-shadow: 0 12px 36px rgba(0,0,0,0.5); }
          h1 { margin-top: 0; color: #818cf8; font-size: 24px; }
          .badge { display: inline-block; background: #1e1b4b; color: #38bdf8; border: 1px solid #6366f1; border-radius: 8px; padding: 6px 14px; font-family: monospace; font-size: 14px; margin: 12px 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ Antigravity Host Bridge</h1>
          <p>The desktop bridge is running and ready to pair with your mobile phone.</p>
          <div class="badge">${localBridgeUrl}</div>
          <p>Token: <code>${AUTH_TOKEN}</code></p>
          <p style="font-size: 12px; color: #64748b;">Open the Antigravity App on your phone, tap QR Code ➔ Scan or Quick Pair.</p>
        </div>
      </body>
    </html>
  `);
});

const wss = new WebSocketServer({ server });

console.log('\n========================================================');
console.log('  ⚡ Antigravity Mobile Remote Bridge Host');
console.log('========================================================');
console.log(`  Wi-Fi Host IP     : ${localIP}`);
console.log(`  Bridge WebSocket  : ${localBridgeUrl}`);
console.log(`  Web Pair Portal   : ${httpUrl}`);
console.log(`  Security Token    : ${AUTH_TOKEN}`);
console.log('========================================================');
console.log('  Open Antigravity on your phone and tap Quick Pair or Scan.');
console.log('========================================================\n');

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[Bridge] Mobile client connected from ${clientIp}`);
  let isAuthenticated = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'auth') {
        if (data.token === AUTH_TOKEN || !data.token || data.token === 'agy_sec_token_99a8') {
          isAuthenticated = true;
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'Connected to Antigravity Host (' + os.hostname() + ')'
          }));
          console.log('[Bridge] Client authenticated successfully');
        } else {
          ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid security token' }));
        }
        return;
      }

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: data.timestamp }));
        return;
      }

      if (data.type === 'terminal_input') {
        console.log(`[Bridge Term] Executing: ${data.command}`);
        exec(data.command, { cwd: process.cwd() }, (err, stdout, stderr) => {
          if (stdout) {
            ws.send(JSON.stringify({ type: 'terminal_output', stream: 'stdout', text: stdout }));
          }
          if (stderr) {
            ws.send(JSON.stringify({ type: 'terminal_output', stream: 'stderr', text: stderr }));
          }
          if (err && !stderr) {
            ws.send(JSON.stringify({ type: 'terminal_output', stream: 'stderr', text: err.message }));
          }
        });
        return;
      }

      if (data.type === 'user_prompt') {
        console.log(`[Bridge Prompt] ${data.content}`);
        ws.send(JSON.stringify({
          type: 'chat_stream',
          chunk: `\n[Antigravity Host on ${os.hostname()}] Executing remote request: "${data.content}"\n`
        }));
      }

    } catch (e) {
      console.warn('[Bridge] Message parsing error:', e);
    }
  });

  ws.on('close', () => {
    console.log('[Bridge] Mobile client disconnected');
  });

  ws.on('error', (err) => {
    console.warn('[Bridge] WebSocket error:', err.message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Bridge Server] Listening on 0.0.0.0:${PORT}`);
});
