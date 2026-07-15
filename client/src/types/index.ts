export interface Credential {
  id: string;
  broker: string;
  name: string;
  apiKey: string;
  userId: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: string | null;
  funds?: number;
  margin?: number;
  holdings?: number;
  clientName?: string;
  totpSecret?: string;
  accessToken?: string | null;
}

export interface Strategy {
  id: string;
  name: string;
  instrument: string;
  type: string;
  status: 'active' | 'inactive';
  capital: number;
  pnl: number;
  tradesCount: number;
  settings: Record<string, any>;
}

export interface Trade {
  id: string;
  strategyId: string;
  strategyName: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  value: number;
  pnl?: number;
  timestamp: string;
}

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxLotLimit: number;
  maxCapital: number;
  maxOpenPositions: number;
  status: 'active' | 'inactive';
  billingCycle?: string;
}

export interface PaymentRecord {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  status: 'success' | 'pending' | 'refunded';
  date: string;
}

export interface TradingSignal {
  id: string;
  instrument: string;
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  status: string;
}

export interface AuditLogEntry {
  timestamp: string;
  type: string;
  source: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  lotMultiplier: number;
  status?: 'active' | 'suspended';
  planId?: string;
  createdAt?: string;
  lastLogin?: string;
  riskSettings?: {
    defaultLotSize: number;
    dailyRiskLimit: number;
    stopLossPct: number;
    targetPct: number;
    maxOpenTrades: number;
  };
}
