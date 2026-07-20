const { data, saveDB, defaultRiskSettings } = require('../config/db');
const { broadcast, calculateOverallPnl, addLog } = require('../services/websocket');
const bcrypt = require('bcryptjs');

// GET /api/admin/users
exports.getUsers = (req, res) => {
  res.json(data.users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    status: u.status, createdAt: u.createdAt, lastLogin: u.lastLogin,
    lotMultiplier: u.lotMultiplier || 1.0,
    riskSettings: u.riskSettings || defaultRiskSettings
  })));
};

// POST /api/admin/users
exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (data.users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'u' + Date.now(),
    name, 
    email, 
    password: hashedPassword, 
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    lotMultiplier: 1.0
  };
  data.users.push(newUser);
  saveDB();
  addLog('success', 'Admin', `New user account created: ${name} (${email})`);
  
  // Return the created user without the password field for security
  const { password: _, ...userResponse } = newUser;
  res.status(201).json(userResponse);
};

// POST /api/admin/users/toggle
exports.toggleUserStatus = (req, res) => {
  const { id } = req.body;
  const targetUser = data.users.find(u => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  if (targetUser.id === req.user.id) return res.status(400).json({ error: 'Cannot suspend your own admin account.' });

  targetUser.status = targetUser.status === 'active' ? 'suspended' : 'active';
  saveDB();
  addLog('warning', 'Admin', `User ${targetUser.name} has been ${targetUser.status}`);
  res.json({ success: true, status: targetUser.status });
};

// POST /api/admin/users/reset-api
exports.resetUserApi = (req, res) => {
  const { id } = req.body;
  const targetUser = data.users.find(u => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  data.credentials = data.credentials.filter(c => c.userDbId !== id && c.userEmail !== targetUser.email);
  saveDB();
  broadcast({ type: 'CREDENTIALS_RESET_FOR_USER', data: { userId: id } });
  addLog('warning', 'Admin', `Reset API credentials for user: ${targetUser.name}`);
  res.json({ success: true });
};

// POST /api/admin/users/assign-plan
exports.assignPlan = (req, res) => {
  const { userId, planId } = req.body;
  const targetUser = data.users.find(u => u.id === userId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  const plan = data.subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  targetUser.planId = planId;
  saveDB();
  broadcast({ type: 'USER_PLAN_UPDATED', data: { userId, planId } });
  addLog('success', 'Admin', `Assigned plan "${plan.name}" to ${targetUser.name}`);
  res.json({ success: true, user: targetUser });
};

// POST /api/admin/subscription-plans
exports.createPlan = (req, res) => {
  const { name, price, durationDays, maxLotLimit, maxCapital, maxOpenPositions, billingCycle } = req.body;
  if (!name || !price || !durationDays) return res.status(400).json({ error: 'Missing required fields' });

  const newPlan = {
    id: 'plan_' + Date.now(), name,
    price: parseFloat(price), durationDays: parseInt(durationDays),
    maxLotLimit: parseInt(maxLotLimit) || 1, maxCapital: parseFloat(maxCapital) || 100000,
    maxOpenPositions: parseInt(maxOpenPositions) || 5, 
    billingCycle: billingCycle || 'Monthly',
    status: 'active'
  };
  data.subscriptionPlans.push(newPlan);
  saveDB();
  broadcast({ type: 'SUBSCRIPTION_PLAN_ADDED', data: newPlan });
  addLog('success', 'Admin', `Created subscription plan: ${name}`);
  res.status(201).json(newPlan);
};

// POST /api/admin/subscription-plans/delete
exports.deletePlan = (req, res) => {
  const { id } = req.body;
  const index = data.subscriptionPlans.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Plan not found' });

  const deleted = data.subscriptionPlans[index];
  data.subscriptionPlans.splice(index, 1);
  saveDB();
  broadcast({ type: 'SUBSCRIPTION_PLAN_DELETED', data: id });
  addLog('warning', 'Admin', `Deleted subscription plan: ${deleted.name}`);
  res.json({ success: true });
};

// POST /api/admin/subscription-plans/update
exports.updatePlan = (req, res) => {
  const { id, name, price, durationDays, maxLotLimit, maxCapital, maxOpenPositions, billingCycle } = req.body;
  if (!id) return res.status(400).json({ error: 'Plan ID is required' });

  const plan = data.subscriptionPlans.find(p => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  if (name) plan.name = name;
  if (price !== undefined) plan.price = parseFloat(price) || 0;
  if (durationDays !== undefined) plan.durationDays = parseInt(durationDays) || 30;
  if (maxLotLimit !== undefined) plan.maxLotLimit = parseInt(maxLotLimit) || 1;
  if (maxCapital !== undefined) plan.maxCapital = parseFloat(maxCapital) || 100000;
  if (maxOpenPositions !== undefined) plan.maxOpenPositions = parseInt(maxOpenPositions) || 5;
  if (billingCycle) plan.billingCycle = billingCycle;

  saveDB();
  broadcast({ type: 'SUBSCRIPTION_PLAN_UPDATED', data: plan });
  addLog('info', 'Admin', `Updated subscription plan template: ${plan.name}`);
  res.json({ success: true, plan });
};

// POST /api/admin/brokers/toggle
exports.toggleBroker = (req, res) => {
  const { id } = req.body;
  const broker = data.supportedBrokers.find(b => b.id === id);
  if (!broker) return res.status(404).json({ error: 'Broker not found' });

  broker.enabled = !broker.enabled;
  broker.status = broker.enabled ? 'active' : 'inactive';
  saveDB();
  broadcast({ type: 'BROKER_TOGGLED', data: broker });
  addLog('info', 'Admin', `${broker.name} has been ${broker.enabled ? 'ENABLED' : 'DISABLED'}`);
  res.json({ success: true, broker });
};

// POST /api/admin/brokers/update
exports.updateBroker = (req, res) => {
  const { id, name } = req.body;
  const broker = data.supportedBrokers.find(b => b.id === id);
  if (!broker) return res.status(404).json({ error: 'Broker not found' });

  if (name) broker.name = name;
  saveDB();
  broadcast({ type: 'BROKERS_UPDATED', data: data.supportedBrokers });
  addLog('info', 'Admin', `Updated broker details: ${broker.name}`);
  res.json({ success: true, broker });
};

// POST /api/admin/brokers/delete
exports.deleteBroker = (req, res) => {
  const { id } = req.body;
  const index = data.supportedBrokers.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Broker not found' });

  const removedBrokerName = data.supportedBrokers[index].name;
  data.supportedBrokers.splice(index, 1);
  saveDB();
  broadcast({ type: 'BROKERS_UPDATED', data: data.supportedBrokers });
  addLog('info', 'Admin', `Deleted broker template: ${removedBrokerName}`);
  res.json({ success: true, message: 'Broker deleted successfully' });
};

// POST /api/admin/signals
exports.broadcastSignal = (req, res) => {
  const { instrument, type, price } = req.body;
  if (!instrument || !type || !price) return res.status(400).json({ error: 'Missing required signal fields' });

  const newSignal = {
    id: 'SIG' + Date.now(), instrument, type,
    price: parseFloat(price), time: new Date().toISOString(), status: 'executed'
  };
  data.signals.push(newSignal);
  saveDB();
  broadcast({ type: 'SIGNAL_BROADCASTED', data: newSignal });
  addLog('success', 'Signal Station', `Broadcasted ${type} signal on ${instrument} @ ${price}`);

  // Simulate trade execution from signal
  const baseQty = 25;
  const associatedBroker = data.credentials.length > 0 ? data.credentials[0].broker : 'Zerodha Kite';
  const executionTrade = {
    id: 'T' + Date.now() + Math.floor(Math.random() * 100),
    strategyId: 'broadcast_sig', strategyName: 'Manual Signal Station',
    instrument, type, price: parseFloat(price), quantity: baseQty,
    value: parseFloat((baseQty * price).toFixed(2)), timestamp: new Date().toISOString()
  };
  data.trades.push(executionTrade);
  if (data.trades.length > 100) data.trades.shift();

  broadcast({
    type: 'TRADE_EXECUTED',
    data: { trade: executionTrade, strategy: { id: 'broadcast_sig', name: 'Manual Signal Station', pnl: 0, tradesCount: 1, instrument, type, status: 'active' }, overallPnl: calculateOverallPnl() }
  });
  addLog('success', associatedBroker, `Signal executed: Placed ${type} order for ${instrument}`);
  res.status(201).json(newSignal);
};

// POST /api/admin/signals/delete
exports.deleteSignal = (req, res) => {
  const { id } = req.body;
  const initialCount = data.signals.length;
  data.signals = data.signals.filter(sig => sig.id !== id);
  if (data.signals.length === initialCount) {
    return res.status(404).json({ error: 'Signal not found' });
  }
  saveDB();
  broadcast({ type: 'SIGNALS_UPDATED', data: data.signals });
  addLog('info', 'Admin', `Deleted signal: ${id}`);
  res.json({ success: true, message: 'Signal deleted successfully' });
};

// POST /api/admin/square-off
exports.squareOff = (req, res) => {
  const count = data.openPositions.length;
  data.openPositions = [];
  saveDB();
  broadcast({ type: 'SQUARE_OFF_ALL', data: { count } });
  addLog('error', 'Emergency Stop', `Emergency Square Off Triggered by Admin. Terminated all active trades!`);
  res.json({ success: true, countSquaredOff: count });
};

// POST /api/admin/users/update
exports.updateUser = (req, res) => {
  const { id, name, email, role, lotMultiplier } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  const targetUser = data.users.find(u => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (email && email !== targetUser.email) {
    if (data.users.some(u => u.email === email && u.id !== id)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    targetUser.email = email;
  }

  if (name) targetUser.name = name;
  if (role) {
    if (targetUser.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote your own admin account.' });
    }
    targetUser.role = role;
  }
  if (lotMultiplier !== undefined) targetUser.lotMultiplier = parseFloat(lotMultiplier) || 1.0;

  saveDB();
  addLog('info', 'Admin', `Updated user account details: ${targetUser.name} (${targetUser.email})`);
  res.json({ success: true, user: targetUser });
};

// POST /api/admin/users/delete
exports.deleteUser = (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  const index = data.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const targetUser = data.users[index];
  if (targetUser.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own admin account.' });
  }

  data.users.splice(index, 1);
  data.credentials = data.credentials.filter(c => c.userDbId !== id && c.userEmail !== targetUser.email);

  saveDB();
  broadcast({ type: 'CREDENTIALS_RESET_FOR_USER', data: { userId: id } });
  addLog('error', 'Admin', `Deleted user account: ${targetUser.name} (${targetUser.email})`);
  res.json({ success: true });
};

// POST /api/admin/strategies
exports.createStrategy = (req, res) => {
  const { asset, assetType, name, strategyCode, quantity, limit, description } = req.body;
  if (!asset || !name) return res.status(400).json({ error: 'Asset and Strategy Name are required' });

  const newStrat = {
    id: 'strat_' + Date.now(),
    asset: asset.toUpperCase(),
    assetType: assetType || 'INDEX',
    name,
    strategyCode: strategyCode || name,
    instrument: asset.toUpperCase(),
    type: assetType || 'INDEX',
    quantity: parseInt(quantity) || 1,
    limit: parseInt(limit) || 1000,
    description: description || 'Algorithmic trading strategy for ' + asset,
    status: 'inactive',
    capital: 100000,
    pnl: 0,
    tradesCount: 0,
    availableOptions: [strategyCode || name, 'Scalp' + asset, 'Grid' + asset]
  };

  data.strategies.push(newStrat);
  saveDB();
  broadcast({ type: 'STRATEGY_ADDED', data: newStrat });
  addLog('success', 'Admin', `Created strategy template: ${newStrat.name} for ${newStrat.asset}`);
  res.status(201).json(newStrat);
};

// POST /api/admin/strategies/update
exports.updateStrategy = (req, res) => {
  const { id, asset, assetType, name, strategyCode, quantity, limit, description, status } = req.body;
  if (!id) return res.status(400).json({ error: 'Strategy ID is required' });

  const strat = data.strategies.find(s => s.id === id);
  if (!strat) return res.status(404).json({ error: 'Strategy not found' });

  if (asset) { strat.asset = asset; strat.instrument = asset; }
  if (assetType) { strat.assetType = assetType; strat.type = assetType; }
  if (name) strat.name = name;
  if (strategyCode) strat.strategyCode = strategyCode;
  if (quantity !== undefined) strat.quantity = parseInt(quantity) || 0;
  if (limit !== undefined) strat.limit = parseInt(limit) || 0;
  if (description !== undefined) strat.description = description;
  if (status) strat.status = status;

  saveDB();
  broadcast({ type: 'STRATEGY_UPDATED', data: strat });
  addLog('info', 'Admin', `Updated strategy parameters for ${strat.asset} (${strat.name})`);
  res.json({ success: true, strategy: strat });
};

// POST /api/admin/strategies/delete
exports.deleteStrategy = (req, res) => {
  const { id } = req.body;
  const index = data.strategies.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Strategy not found' });

  const deleted = data.strategies[index];
  data.strategies.splice(index, 1);
  saveDB();
  broadcast({ type: 'STRATEGY_DELETED', data: id });
  addLog('warning', 'Admin', `Deleted strategy: ${deleted.name} (${deleted.asset})`);
  res.json({ success: true });
};

// POST /api/admin/strategies/toggle
exports.toggleStrategy = (req, res) => {
  const { id } = req.body;
  const strat = data.strategies.find(s => s.id === id);
  if (!strat) return res.status(404).json({ error: 'Strategy not found' });

  strat.status = strat.status === 'active' ? 'inactive' : 'active';
  saveDB();
  broadcast({ type: 'STRATEGY_TOGGLED', data: strat });
  addLog(
    strat.status === 'active' ? 'success' : 'warning',
    'Admin',
    `Strategy '${strat.name}' has been ${strat.status === 'active' ? 'STARTED' : 'STOPPED'}`
  );
  res.json({ success: true, strategy: strat });
};
