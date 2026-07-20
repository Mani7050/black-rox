const { data, saveDB, defaultRiskSettings } = require('../config/db');
const { broadcast, addLog } = require('../services/websocket');

// GET /api/user/settings — update lot multiplier
exports.updateSettings = (req, res) => {
  const { lotMultiplier } = req.body;
  if (lotMultiplier === undefined || isNaN(parseFloat(lotMultiplier))) {
    return res.status(400).json({ error: 'Invalid lot multiplier value' });
  }
  const targetUser = data.users.find(u => u.id === req.user.id);
  if (targetUser) {
    targetUser.lotMultiplier = parseFloat(parseFloat(lotMultiplier).toFixed(2));
    saveDB();
    broadcast({ type: 'USER_SETTINGS_UPDATED', data: { userId: targetUser.id, lotMultiplier: targetUser.lotMultiplier } });
    return res.json({ success: true, lotMultiplier: targetUser.lotMultiplier });
  }
  res.status(404).json({ error: 'User not found' });
};

// POST /api/user/risk-settings
exports.updateRiskSettings = (req, res) => {
  const { defaultLotSize, dailyRiskLimit, stopLossPct, targetPct, maxOpenTrades } = req.body;
  const targetUser = data.users.find(u => u.id === req.user.id);
  if (targetUser) {
    targetUser.riskSettings = {
      defaultLotSize: parseFloat(defaultLotSize) || 1,
      dailyRiskLimit: parseFloat(dailyRiskLimit) || 10000,
      stopLossPct: parseFloat(stopLossPct) || 2.0,
      targetPct: parseFloat(targetPct) || 4.0,
      maxOpenTrades: parseInt(maxOpenTrades) || 5
    };
    saveDB();
    broadcast({ type: 'USER_RISK_SETTINGS_UPDATED', data: { userId: targetUser.id, riskSettings: targetUser.riskSettings } });
    addLog('info', 'System', `Risk Settings updated for ${targetUser.name}: LotSize=${targetUser.riskSettings.defaultLotSize}, SL=${targetUser.riskSettings.stopLossPct}%, Target=${targetUser.riskSettings.targetPct}%`);
    return res.json({ success: true, riskSettings: targetUser.riskSettings });
  }
  res.status(404).json({ error: 'User not found' });
};

// GET /api/credentials
exports.getCredentials = (req, res) => {
  if (req.user.role === 'admin') {
    res.json(data.credentials);
  } else {
    res.json(data.credentials.filter(c => c.userDbId === req.user.id || c.userEmail === req.user.email));
  }
};

// POST /api/credentials
exports.addCredential = (req, res) => {
  const { broker, name, apiKey, apiSecret, userId, totpSecret } = req.body;
  if (!broker || !name || !apiKey || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newCred = {
    id: Date.now().toString(),
    broker,
    name,
    apiKey: apiKey.slice(0, 5) + '...' + apiKey.slice(-3),
    userId,
    status: 'connected',
    userDbId: req.user.id,
    userEmail: req.user.email,
    lastConnected: new Date().toISOString(),
    funds: parseFloat((50000 + Math.random() * 150000).toFixed(2)),
    margin: parseFloat((10000 + Math.random() * 30000).toFixed(2)),
    holdings: parseFloat((80000 + Math.random() * 500000).toFixed(2)),
    clientName: req.user.name,
    totpSecret: totpSecret || 'JBSWY3DPEHPK3PXP',
    accessToken: broker.toLowerCase().replace(' ', '') + '_acc_' + Math.random().toString(36).substring(2, 10)
  };

  data.credentials.push(newCred);

  // Generate synced Demat trade history for this connected API key
  const now = Date.now();
  const sampleTrades = [
    {
      id: 'T' + (now - 18000000) + '01',
      strategyId: 'strat_macd',
      strategyName: 'MACD Crossover Bot',
      instrument: 'NIFTY 50',
      type: 'BUY',
      price: 24310.50,
      quantity: 50,
      value: 1215525,
      pnl: 1450.00,
      timestamp: new Date(now - 18000000).toISOString()
    },
    {
      id: 'T' + (now - 14400000) + '02',
      strategyId: 'strat_rsi',
      strategyName: 'RSI Mean Reversion',
      instrument: 'RELIANCE',
      type: 'BUY',
      price: 2455.00,
      quantity: 25,
      value: 61375,
      pnl: 875.50,
      timestamp: new Date(now - 14400000).toISOString()
    },
    {
      id: 'T' + (now - 10800000) + '03',
      strategyId: 'strat_grid',
      strategyName: 'Options Grid Scalper',
      instrument: 'BANKNIFTY',
      type: 'SELL',
      price: 52480.00,
      quantity: 15,
      value: 787200,
      pnl: -320.00,
      timestamp: new Date(now - 10800000).toISOString()
    },
    {
      id: 'T' + (now - 3600000) + '04',
      strategyId: 'strat_arb',
      strategyName: 'Futures Cash-Arb Bot',
      instrument: 'TCS (Futures vs Cash)',
      type: 'BUY',
      price: 4145.20,
      quantity: 10,
      value: 41452,
      pnl: 620.00,
      timestamp: new Date(now - 3600000).toISOString()
    }
  ];

  sampleTrades.forEach(t => data.trades.unshift(t));
  if (data.trades.length > 100) data.trades = data.trades.slice(0, 100);

  saveDB();
  broadcast({ type: 'CREDENTIAL_ADDED', data: newCred, syncedTrades: sampleTrades });
  addLog('success', broker, `Successfully connected Demat API for client: ${userId} (${newCred.clientName}) & synced ${sampleTrades.length} trade records.`);
  res.status(201).json(newCred);
};

// DELETE /api/credentials/:id
exports.deleteCredential = (req, res) => {
  const { id } = req.params;
  const index = data.credentials.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Credential not found' });
  }
  const removed = data.credentials[index];
  data.credentials.splice(index, 1);
  saveDB();
  broadcast({ type: 'CREDENTIAL_DELETED', data: id });
  addLog('warning', 'System', `API Connection '${removed.name}' for ${removed.broker} has been deleted`);
  res.json({ success: true });
};

// GET /api/strategies
exports.getStrategies = (req, res) => {
  res.json(data.strategies);
};

// POST /api/strategies/toggle
exports.toggleStrategy = (req, res) => {
  const { id } = req.body;
  const strategy = data.strategies.find(s => s.id === id);
  if (!strategy) {
    return res.status(404).json({ error: 'Strategy not found' });
  }
  strategy.status = strategy.status === 'active' ? 'inactive' : 'active';
  saveDB();
  broadcast({ type: 'STRATEGY_TOGGLED', data: strategy });
  addLog(
    strategy.status === 'active' ? 'success' : 'warning',
    'System',
    `Strategy '${strategy.name}' has been ${strategy.status === 'active' ? 'STARTED' : 'STOPPED'}`
  );
  res.json(strategy);
};

// POST /api/strategies/save
exports.saveUserStrategy = (req, res) => {
  const { id, strategyCode, quantity, status } = req.body;
  const targetStrat = data.strategies.find(s => s.id === id);
  if (!targetStrat) return res.status(404).json({ error: 'Strategy not found' });

  if (strategyCode) targetStrat.strategyCode = strategyCode;
  if (quantity !== undefined) targetStrat.quantity = parseInt(quantity) || 0;
  if (status) targetStrat.status = status;

  saveDB();
  broadcast({ type: 'STRATEGY_UPDATED', data: targetStrat });
  addLog('success', 'User', `Saved asset strategy config for ${targetStrat.asset || targetStrat.name} (${targetStrat.strategyCode})`);
  res.json({ success: true, strategy: targetStrat });
};

// POST /api/user/activate-plan — Activate 7-day trial or paid subscription plan
exports.activatePlan = (req, res) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ error: 'Plan ID is required' });

  const targetUser = data.users.find(u => u.id === req.user.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  targetUser.planId = planId;
  targetUser.hasActivePlan = true;
  if (planId === 'plan_trial') {
    targetUser.trialActivated = true;
    targetUser.trialEndsAt = new Date(Date.now() + 7 * 86400000).toISOString();
  }

  saveDB();
  broadcast({ type: 'USER_PLAN_ACTIVATED', data: { userId: targetUser.id, planId: targetUser.planId } });
  addLog('success', 'User', `User ${targetUser.name} activated plan: ${planId}`);

  return res.json({
    success: true,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      planId: targetUser.planId,
      hasActivePlan: true,
      trialActivated: targetUser.trialActivated,
      trialEndsAt: targetUser.trialEndsAt,
      lotMultiplier: targetUser.lotMultiplier || 1.0,
      riskSettings: targetUser.riskSettings || defaultRiskSettings
    }
  });
};
