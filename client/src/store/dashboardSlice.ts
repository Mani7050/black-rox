import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, Credential, Strategy, Trade, LogEntry } from '../types';

export type { User, Credential, Strategy, Trade, LogEntry };

interface DashboardState {
  isLoggedIn: boolean;
  authToken: string | null;
  user: User | null;
  activeTab: string;
  credentials: Credential[];
  strategies: Strategy[];
  trades: Trade[];
  logs: LogEntry[];
  overallPnl: number;
  isDarkMode: boolean;
  isConnected: boolean;
  isConnecting: boolean;
}

const initialState: DashboardState = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  authToken: localStorage.getItem('authToken'),
  user: (() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  })(),
  activeTab: 'user_dashboard',
  credentials: [],
  strategies: [],
  trades: [],
  logs: [],
  overallPnl: 0,
  isDarkMode: localStorage.getItem('isDarkMode_v2') === 'true',
  isConnected: false,
  isConnecting: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string | null; user: User | null }>) => {
      state.authToken = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = !!action.payload.token;
      if (action.payload.token) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('currentUser', JSON.stringify(action.payload.user));
      } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setCredentials: (state, action: PayloadAction<Credential[]>) => {
      state.credentials = action.payload;
    },
    addCredential: (state, action: PayloadAction<Credential>) => {
      state.credentials.push(action.payload);
    },
    removeCredential: (state, action: PayloadAction<string>) => {
      state.credentials = state.credentials.filter(c => c.id !== action.payload);
    },
    setStrategies: (state, action: PayloadAction<Strategy[]>) => {
      state.strategies = action.payload;
    },
    updateStrategy: (state, action: PayloadAction<Strategy>) => {
      const index = state.strategies.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.strategies[index] = action.payload;
      }
    },
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    setLogs: (state, action: PayloadAction<LogEntry[]>) => {
      state.logs = action.payload;
    },
    addLog: (state, action: PayloadAction<LogEntry>) => {
      state.logs.unshift(action.payload);
    },
    setOverallPnl: (state, action: PayloadAction<number>) => {
      state.overallPnl = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('isDarkMode_v2', String(action.payload));
    },
    setConnectionState: (state, action: PayloadAction<{ connected: boolean; connecting: boolean }>) => {
      state.isConnected = action.payload.connected;
      state.isConnecting = action.payload.connecting;
    },
  },
});

export const {
  setAuth,
  setActiveTab,
  setCredentials,
  addCredential,
  removeCredential,
  setStrategies,
  updateStrategy,
  setTrades,
  addTrade,
  setLogs,
  addLog,
  setOverallPnl,
  setDarkMode,
  setConnectionState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
