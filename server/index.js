// Trigger nodemon reload for live MongoDB Atlas connection
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// ─── App Setup ───────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── Database ────────────────────────────────────────────
const { loadDB } = require('./config/db');

async function startServer() {
  await loadDB();

  // ─── WebSocket ───────────────────────────────────────────
  const { initWebSocket } = require('./services/websocket');
  initWebSocket(server);

  // ─── Routes ──────────────────────────────────────────────
  const authRoutes = require('./routes/authRoutes');
  const userRoutes = require('./routes/userRoutes');
  const adminRoutes = require('./routes/adminRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api', userRoutes);          // /api/credentials, /api/strategies
  app.use('/api/admin', adminRoutes);

  // ─── Market Simulation ──────────────────────────────────
  const { startMarketSimulation } = require('./services/marketSimulation');
  startMarketSimulation();

  // ─── Start Server ────────────────────────────────────────
  server.listen(PORT, () => {
    console.log(`⚡ BlackRox Algo Trading backend running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
});
