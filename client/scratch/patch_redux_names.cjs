const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace action imports with namespace import
const targetImports = `import {
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

const replacementImports = `import * as dashboardActions from './store/dashboardSlice';`;

content = content.replace(targetImports, replacementImports);

// 2. Replace setter bodies to use the namespace actions
const targetSettersBlock = `  const setIsLoggedIn = (val: boolean | ((prev: boolean) => boolean)) => {
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
  };`;

const replacementSettersBlock = `  const setIsLoggedIn = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isLoggedIn) : val;
    dispatch(dashboardActions.setAuth({ token: nextVal ? authToken : null, user: nextVal ? user : null }));
  };

  const setAuthToken = (val: string | null | ((prev: string | null) => string | null)) => {
    const nextVal = typeof val === 'function' ? val(authToken) : val;
    dispatch(dashboardActions.setAuth({ token: nextVal, user }));
  };

  const setUser = (val: User | null | ((prev: User | null) => User | null)) => {
    const nextVal = typeof val === 'function' ? val(user) : val;
    dispatch(dashboardActions.setAuth({ token: authToken, user: nextVal }));
  };

  const setActiveTab = (val: string | ((prev: string) => string)) => {
    const nextVal = typeof val === 'function' ? val(activeTab) : val;
    dispatch(dashboardActions.setActiveTab(nextVal));
  };

  const setCredentials = (val: Credential[] | ((prev: Credential[]) => Credential[])) => {
    const nextVal = typeof val === 'function' ? val(credentials) : val;
    dispatch(dashboardActions.setCredentials(nextVal));
  };

  const setStrategies = (val: Strategy[] | ((prev: Strategy[]) => Strategy[])) => {
    const nextVal = typeof val === 'function' ? val(strategies) : val;
    dispatch(dashboardActions.setStrategies(nextVal));
  };

  const setTrades = (val: Trade[] | ((prev: Trade[]) => Trade[])) => {
    const nextVal = typeof val === 'function' ? val(trades) : val;
    dispatch(dashboardActions.setTrades(nextVal));
  };

  const setLogs = (val: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => {
    const nextVal = typeof val === 'function' ? val(logs) : val;
    dispatch(dashboardActions.setLogs(nextVal));
  };

  const setOverallPnl = (val: number | ((prev: number) => number)) => {
    const nextVal = typeof val === 'function' ? val(overallPnl) : val;
    dispatch(dashboardActions.setOverallPnl(nextVal));
  };

  const setIsDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isDarkMode) : val;
    dispatch(dashboardActions.setDarkMode(nextVal));
  };`;

content = content.replace(targetSettersBlock, replacementSettersBlock);

// 3. Replace connection setters
const targetConnectionBlock = `  const setIsConnected = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnected) : val;
    dispatch(setConnectionState({ connected: nextVal, connecting: isConnecting }));
  };

  const setIsConnecting = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnecting) : val;
    dispatch(setConnectionState({ connected: isConnected, connecting: nextVal }));
  };`;

const replacementConnectionBlock = `  const setIsConnected = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnected) : val;
    dispatch(dashboardActions.setConnectionState({ connected: nextVal, connecting: isConnecting }));
  };

  const setIsConnecting = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isConnecting) : val;
    dispatch(dashboardActions.setConnectionState({ connected: isConnected, connecting: nextVal }));
  };`;

content = content.replace(targetConnectionBlock, replacementConnectionBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully fixed Redux name shadowing in App.tsx!");
