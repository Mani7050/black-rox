const mongoose = require('mongoose');

const defaultRiskSettings = {
  defaultLotSize: 1,
  dailyRiskLimit: 10000,
  stopLossPct: 2.0,
  targetPct: 4.0,
  maxOpenTrades: 5
};

// Default seed data (used when database is empty)
const defaultData = {
  users: [
    {
      id: 'u1',
      email: 'admin@back.com',
      password: 'Test@123',
      name: 'Terminal Admin',
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      riskSettings: { ...defaultRiskSettings }
    }
  ],
  credentials: [],
  strategies: [
    { id: 'strat_macd', name: 'MACD Crossover Bot', instrument: 'NIFTY 50', type: 'Momentum', status: 'inactive', capital: 50000, pnl: 0, tradesCount: 0, settings: { shortPeriod: 12, longPeriod: 26, signalPeriod: 9 } },
    { id: 'strat_rsi', name: 'RSI Mean Reversion', instrument: 'RELIANCE', type: 'Mean Reversion', status: 'inactive', capital: 100000, pnl: 0, tradesCount: 0, settings: { rsiOversold: 30, rsiOverbought: 70, period: 14 } },
    { id: 'strat_grid', name: 'Options Grid Scalper', instrument: 'BANKNIFTY', type: 'Grid Scalping', status: 'inactive', capital: 75000, pnl: 0, tradesCount: 0, settings: { gridLevels: 8, upperRange: 53000, lowerRange: 52000 } },
    { id: 'strat_arb', name: 'Futures Cash-Arb Bot', instrument: 'TCS (Futures vs Cash)', type: 'Arbitrage', status: 'inactive', capital: 150000, pnl: 0, tradesCount: 0, settings: { minSpreadPct: 0.35 } }
  ],
  trades: [],
  logs: [],
  openPositions: [],
  subscriptionPlans: [
    { id: 'plan_trial', name: '7-Day Trial', price: 0, durationDays: 7, maxLotLimit: 1, maxCapital: 10000, maxOpenPositions: 1, status: 'active' },
    { id: 'plan_basic', name: 'Basic Plan', price: 1999, durationDays: 30, maxLotLimit: 2, maxCapital: 100000, maxOpenPositions: 2, status: 'active' },
    { id: 'plan_pro', name: 'Pro Scalper', price: 4999, durationDays: 30, maxLotLimit: 10, maxCapital: 500000, maxOpenPositions: 5, status: 'active' },
    { id: 'plan_vip', name: 'VIP Unlimited', price: 9999, durationDays: 90, maxLotLimit: 50, maxCapital: 2500000, maxOpenPositions: 15, status: 'active' }
  ],
  supportedBrokers: [
    { id: 'zerodha', name: 'Zerodha Kite', enabled: true, status: 'active' },
    { id: 'angelone', name: 'Angel One', enabled: true, status: 'active' },
    { id: 'upstox', name: 'Upstox', enabled: true, status: 'active' },
    { id: 'dhan', name: 'Dhan', enabled: false, status: 'inactive' }
  ],
  payments: [],
  signals: [],
  auditLogs: []
};

// In-memory data store cache (accessed by other controllers)
let data = {
  users: [],
  credentials: [],
  strategies: [],
  trades: [],
  logs: [],
  openPositions: [],
  subscriptionPlans: [],
  supportedBrokers: [],
  payments: [],
  signals: [],
  auditLogs: []
};

const collections = Object.keys(data);
const models = {};

// Initialize Mongoose Schemas dynamically with strict: false (schemaless document storage)
collections.forEach(col => {
  const schema = new mongoose.Schema({}, { strict: false, versionKey: false });
  // Model Name: e.g. users -> User, strategies -> Strategy
  const modelName = col.charAt(0).toUpperCase() + col.slice(1).replace(/s$/, '');
  models[col] = mongoose.model(modelName, schema, col);
});

// Load DB from MongoDB on startup
async function loadDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blackrox';
  console.log(`📡 Connecting to MongoDB at ${mongoURI}...`);

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
      console.log('✓ Connected to MongoDB');
    }

    for (const col of collections) {
      const docs = await models[col].find({}).lean();
      if (docs && docs.length > 0) {
        data[col] = docs.map(doc => {
          const cleanDoc = { ...doc };
          if (cleanDoc._id) {
            cleanDoc.id = cleanDoc.id || cleanDoc._id.toString();
          }
          return cleanDoc;
        });
      } else {
        // If collection is empty, seed it
        if (defaultData[col] && defaultData[col].length > 0) {
          console.log(`🌱 Seeding default data for collection: ${col}`);
          await models[col].insertMany(defaultData[col]);
          data[col] = JSON.parse(JSON.stringify(defaultData[col]));
        } else {
          data[col] = [];
        }
      }
    }
    console.log('✓ Database fully synced from MongoDB');
  } catch (err) {
    console.error('❌ Failed to load/connect to MongoDB, using seed data in memory:', err);
    // Fallback to local defaultData
    for (const col of collections) {
      data[col] = JSON.parse(JSON.stringify(defaultData[col]));
    }
  }
}

// Background sync function
async function saveDBAsync() {
  if (mongoose.connection.readyState !== 1) {
    return; // MongoDB not connected
  }

  for (const col of collections) {
    const currentItems = data[col];

    if (col === 'logs' || col === 'auditLogs' || col === 'trades' || col === 'payments' || col === 'signals') {
      // History lists: replace entire collection to maintain clean index/timestamp order
      await models[col].deleteMany({});
      if (currentItems.length > 0) {
        // Remove _id from cloned items to prevent duplication errors
        const sanitizedItems = currentItems.map(({ _id, ...rest }) => rest);
        await models[col].insertMany(sanitizedItems);
      }
    } else {
      // Key configuration collections: Sync, update, delete
      const existingDocs = await models[col].find({}, { id: 1 }).lean();
      const existingIds = existingDocs.map(d => d.id).filter(Boolean);
      const currentIds = currentItems.map(d => d.id).filter(Boolean);

      // 1. Delete items no longer in in-memory store
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
      if (idsToDelete.length > 0) {
        await models[col].deleteMany({ id: { $in: idsToDelete } });
      }

      // 2. Upsert existing/new items
      for (const item of currentItems) {
        if (item.id) {
          const { _id, ...updateData } = item;
          await models[col].updateOne({ id: item.id }, { $set: updateData }, { upsert: true });
        }
      }
    }
  }
}

// Synchronous wrapper used by controllers
function saveDB() {
  saveDBAsync().catch(err => {
    console.error('❌ Failed to background sync memory to MongoDB:', err);
  });
}

module.exports = { data, saveDB, loadDB, defaultRiskSettings };
