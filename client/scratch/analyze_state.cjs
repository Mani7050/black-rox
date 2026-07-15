const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const states = [
  'isLoggedIn',
  'authToken',
  'user',
  'activeTab',
  'credentials',
  'strategies',
  'trades',
  'logs',
  'overallPnl',
  'isDarkMode',
  'isConnected',
  'isConnecting'
];

console.log("Analyzing file size:", content.length);

states.forEach(state => {
  const setter = 'set' + state.charAt(0).toUpperCase() + state.slice(1);
  const regex = new RegExp(setter, 'g');
  const matches = content.match(regex);
  console.log(`${state}: ${matches ? matches.length : 0} setter matches`);
});
