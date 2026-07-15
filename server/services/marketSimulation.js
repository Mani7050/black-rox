const { data, saveDB, defaultRiskSettings } = require('../config/db');
const { broadcast, calculateOverallPnl, addLog } = require('./websocket');

const instruments = {
  'NIFTY 50': { price: 24350, spread: 2, decimal: 2 },
  'RELIANCE': { price: 2460, spread: 1, decimal: 2 },
  'BANKNIFTY': { price: 52500, spread: 5, decimal: 2 },
  'TCS (Futures vs Cash)': { price: 4150, spread: 2, decimal: 2 }
};

function startMarketSimulation() {
  setInterval(() => {
    // 1. Update instrument prices slightly
    for (let key in instruments) {
      const inst = instruments[key];
      const change = (Math.random() - 0.5) * inst.spread * 0.5;
      inst.price = parseFloat((inst.price + change).toFixed(inst.decimal));
    }

    // 2. Broadcast price ticks
    broadcast({
      type: 'TICKS',
      data: {
        'NIFTY 50': instruments['NIFTY 50'].price,
        'RELIANCE': instruments['RELIANCE'].price,
        'BANKNIFTY': instruments['BANKNIFTY'].price,
        'TCS (Futures vs Cash)': instruments['TCS (Futures vs Cash)'].price
      }
    });

    // 3. Check SL / Target exits for open positions
    const activeUser = data.users.find(u => u.role === 'user') || { lotMultiplier: 1.0, riskSettings: defaultRiskSettings };
    const userRisk = activeUser.riskSettings || defaultRiskSettings;

    data.openPositions = data.openPositions.filter(pos => {
      const instPrice = instruments[pos.instrument]?.price;
      if (!instPrice) return true;

      let hitExit = false;
      let exitType = '';
      let exitPnl = 0;

      const stopLossPct = userRisk.stopLossPct || 2.0;
      const targetPct = userRisk.targetPct || 4.0;

      if (pos.type === 'BUY') {
        const slPrice = pos.entryPrice * (1 - stopLossPct / 100);
        const tpPrice = pos.entryPrice * (1 + targetPct / 100);
        if (instPrice <= slPrice) {
          hitExit = true; exitType = 'SL HIT';
          exitPnl = parseFloat(((slPrice - pos.entryPrice) * pos.quantity).toFixed(2));
        } else if (instPrice >= tpPrice) {
          hitExit = true; exitType = 'TARGET HIT';
          exitPnl = parseFloat(((tpPrice - pos.entryPrice) * pos.quantity).toFixed(2));
        }
      } else if (pos.type === 'SELL') {
        const slPrice = pos.entryPrice * (1 + stopLossPct / 100);
        const tpPrice = pos.entryPrice * (1 - targetPct / 100);
        if (instPrice >= slPrice) {
          hitExit = true; exitType = 'SL HIT';
          exitPnl = parseFloat(((pos.entryPrice - slPrice) * pos.quantity).toFixed(2));
        } else if (instPrice <= tpPrice) {
          hitExit = true; exitType = 'TARGET HIT';
          exitPnl = parseFloat(((pos.entryPrice - tpPrice) * pos.quantity).toFixed(2));
        }
      }

      if (hitExit) {
        const exitPrice = pos.type === 'BUY'
          ? (exitType === 'SL HIT' ? pos.entryPrice * (1 - stopLossPct / 100) : pos.entryPrice * (1 + targetPct / 100))
          : (exitType === 'SL HIT' ? pos.entryPrice * (1 + stopLossPct / 100) : pos.entryPrice * (1 - targetPct / 100));

        const exitTrade = {
          id: 'T' + Date.now() + Math.floor(Math.random() * 100),
          strategyId: pos.strategyId, strategyName: pos.strategyName,
          instrument: pos.instrument, type: pos.type === 'BUY' ? 'SELL' : 'BUY',
          price: parseFloat(exitPrice.toFixed(2)), quantity: pos.quantity,
          value: parseFloat((pos.quantity * exitPrice).toFixed(2)),
          pnl: exitPnl, timestamp: new Date().toISOString()
        };

        const strategy = data.strategies.find(s => s.id === pos.strategyId);
        if (strategy) {
          strategy.pnl = parseFloat((strategy.pnl + exitPnl).toFixed(2));
          strategy.tradesCount += 1;
          broadcast({ type: 'TRADE_EXECUTED', data: { trade: exitTrade, strategy, overallPnl: calculateOverallPnl() } });
        }

        data.trades.push(exitTrade);
        if (data.trades.length > 100) data.trades.shift();
        saveDB();

        const associatedBroker = data.credentials.length > 0 ? data.credentials[0].broker : 'Zerodha Kite';
        addLog('warning', pos.strategyName, `Position Exit: [${exitType}] Triggered @ ${exitPrice.toFixed(2)}`);
        addLog(exitPnl >= 0 ? 'success' : 'error', associatedBroker, `Closed position: ${exitTrade.type} ${pos.quantity} lots ${pos.instrument} | P&L: ${exitPnl >= 0 ? '+' : ''}${exitPnl}`);
        return false; // remove from openPositions
      }
      return true; // keep
    });

    // 4. Simulate trades for active strategies
    data.strategies.forEach(strategy => {
      if (strategy.status !== 'active') return;

      const maxOpenTrades = userRisk.maxOpenTrades || 5;
      if (data.openPositions.length >= maxOpenTrades) {
        if (Math.random() < 0.05) {
          addLog('warning', 'Risk Control', `Order blocked: Max open trades limit (${maxOpenTrades}) reached.`);
        }
        return;
      }

      if (Math.random() < 0.08) {
        const inst = instruments[strategy.instrument];
        if (!inst) return;

        const isBuy = Math.random() > 0.5;
        const baseQty = strategy.id === 'strat_grid' ? 15 : 25;
        const qty = baseQty * (activeUser.lotMultiplier || 1.0) * (userRisk.defaultLotSize || 1);
        const tradePrice = inst.price;
        const tradeVal = parseFloat((qty * tradePrice).toFixed(2));

        const newTrade = {
          id: 'T' + Date.now() + Math.floor(Math.random() * 100),
          strategyId: strategy.id, strategyName: strategy.name,
          instrument: strategy.instrument, type: isBuy ? 'BUY' : 'SELL',
          price: tradePrice, quantity: qty, value: tradeVal,
          timestamp: new Date().toISOString()
        };

        strategy.tradesCount += 1;
        data.trades.push(newTrade);
        if (data.trades.length > 100) data.trades.shift();
        saveDB();

        data.openPositions.push({
          id: newTrade.id, strategyId: strategy.id, strategyName: strategy.name,
          instrument: strategy.instrument, type: newTrade.type,
          entryPrice: tradePrice, quantity: qty, timestamp: newTrade.timestamp
        });

        broadcast({ type: 'TRADE_EXECUTED', data: { trade: newTrade, strategy, overallPnl: calculateOverallPnl() } });

        const associatedBroker = data.credentials.length > 0 ? data.credentials[0].broker : 'Zerodha Kite';
        const side = isBuy ? 'BUY' : 'SELL';
        addLog('info', strategy.name, `Signal ${side} trigger at ${tradePrice} for ${strategy.instrument}`);
        addLog('success', associatedBroker, `Order Placed: ${side} ${qty} lots ${strategy.instrument} @ ${tradePrice}`);
      }
    });

  }, 3500);
}

module.exports = { startMarketSimulation };
