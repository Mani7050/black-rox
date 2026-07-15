const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Redux imports at the top
const targetImports = `import { useState, useEffect, useRef } from 'react';`;
const replacementImports = `import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from './store';
import {
  setAuth,
  setActiveTab,
  setCredentials,
  setStrategies,
  setTrades,
  setLogs,
  setOverallPnl,
  setDarkMode,
  setConnectionState
} from './store/dashboardSlice';`;

content = content.replace(targetImports, replacementImports);

// 2. Replace core states block
const targetStatesBlock = `  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<string>('user_dashboard');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [overallPnl, setOverallPnl] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);`;

const replacementStatesBlock = `  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(state => state.dashboard.isLoggedIn);
  const authToken = useAppSelector(state => state.dashboard.authToken);
  const user = useAppSelector(state => state.dashboard.user);
  const activeTab = useAppSelector(state => state.dashboard.activeTab);
  const credentials = useAppSelector(state => state.dashboard.credentials);
  const strategies = useAppSelector(state => state.dashboard.strategies);
  const trades = useAppSelector(state => state.dashboard.trades);
  const logs = useAppSelector(state => state.dashboard.logs);
  const overallPnl = useAppSelector(state => state.dashboard.overallPnl);
  const isDarkMode = useAppSelector(state => state.dashboard.isDarkMode);

  const setIsLoggedIn = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isLoggedIn) : val;
    dispatch(setAuth({ token: nextVal ? authToken : null, user: nextVal ? user : null }));
  };

  const setAuthToken = (val: string | null | ((prev: string | null) => string | null)) => {
    const nextVal = typeof val === 'function' ? val(authToken) : val;
    dispatch(setAuth({ token: nextVal, user }));
  };

  const setUser = (val: User | null | ((prev: User | null) => User | null)) => {
    const nextVal = typeof val === 'function' ? val(user) : val;
    dispatch(setAuth({ token: authToken, user: nextVal }));
  };

  const setActiveTab = (val: string | ((prev: string) => string)) => {
    const nextVal = typeof val === 'function' ? val(activeTab) : val;
    dispatch(setActiveTab(nextVal));
  };

  const setCredentials = (val: Credential[] | ((prev: Credential[]) => Credential[])) => {
    const nextVal = typeof val === 'function' ? val(credentials) : val;
    dispatch(setCredentials(nextVal));
  };

  const setStrategies = (val: Strategy[] | ((prev: Strategy[]) => Strategy[])) => {
    const nextVal = typeof val === 'function' ? val(strategies) : val;
    dispatch(setStrategies(nextVal));
  };

  const setTrades = (val: Trade[] | ((prev: Trade[]) => Trade[])) => {
    const nextVal = typeof val === 'function' ? val(trades) : val;
    dispatch(setTrades(nextVal));
  };

  const setLogs = (val: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => {
    const nextVal = typeof val === 'function' ? val(logs) : val;
    dispatch(setLogs(nextVal));
  };

  const setOverallPnl = (val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(overallPnl) : val;
    dispatch(setOverallPnl(nextVal));
  };

  const setIsDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isDarkMode) : val;
    dispatch(setDarkMode(nextVal));
  };

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');`;

content = content.replace(targetStatesBlock, replacementStatesBlock);

// 3. Replace websocket states block
const targetConnectionBlock = `  // WebSockets and connection state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);`;

const replacementConnectionBlock = `  // WebSockets and connection state
  const isConnected = useAppSelector(state => state.dashboard.isConnected);
  const isConnecting = useAppSelector(state => state.dashboard.isConnecting);

  const setIsConnected = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnected) : val;
    dispatch(setConnectionState({ connected: nextVal, connecting: isConnecting }));
  };

  const setIsConnecting = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnecting) : val;
    dispatch(setConnectionState({ connected: isConnected, connecting: nextVal }));
  };`;

content = content.replace(targetConnectionBlock, replacementConnectionBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched App.tsx to use Redux State Store!");
