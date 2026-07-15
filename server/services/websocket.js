const WebSocket = require('ws');
const { data, saveDB } = require('../config/db');

let clients = new Set();
let wss = null;

function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);

    // Send initial state to newly connected client
    ws.send(JSON.stringify({
      type: 'INIT',
      data: {
        strategies: data.strategies,
        credentials: data.credentials,
        trades: data.trades.slice(-20),
        logs: data.logs.slice(-50),
        overallPnl: calculateOverallPnl(),
        subscriptionPlans: data.subscriptionPlans,
        supportedBrokers: data.supportedBrokers,
        payments: data.payments,
        signals: data.signals,
        auditLogs: data.auditLogs
      }
    }));

    ws.on('close', () => {
      clients.delete(ws);
    });
  });
}

function broadcast(msg) {
  const payload = JSON.stringify(msg);
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function calculateOverallPnl() {
  return data.strategies.reduce((sum, s) => sum + s.pnl, 0);
}

function addLog(type, source, message) {
  const newLog = {
    timestamp: new Date().toISOString(),
    type,
    source,
    message
  };
  data.logs.push(newLog);
  if (data.logs.length > 200) data.logs.shift();
  saveDB();
  broadcast({ type: 'NEW_LOG', data: newLog });
}

module.exports = { initWebSocket, broadcast, calculateOverallPnl, addLog };
