const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/App.tsx');
console.log('Target file path:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject API_BASE_URL and WS_BASE_URL declarations if not present
if (!content.includes('const API_BASE_URL =')) {
  const insertIndex = content.indexOf('export function App() {');
  if (insertIndex === -1) {
    console.error('Could not find "export function App() {" to insert base URLs.');
    process.exit(1);
  }

  const declarations = `const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://black-rox.onrender.com';

const WS_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'ws://localhost:5000'
  : 'wss://black-rox.onrender.com';

`;

  content = content.slice(0, insertIndex) + declarations + content.slice(insertIndex);
  console.log('Injected API_BASE_URL and WS_BASE_URL declarations.');
} else {
  console.log('API_BASE_URL declarations already present.');
}

// 2. Replace http://localhost:5000 with API_BASE_URL
// Single quotes: 'http://localhost:5000/api/...' -> `${API_BASE_URL}/api/...`
let originalLength = content.length;
content = content.replace(/'http:\/\/localhost:5000([^']+)'/g, '`${API_BASE_URL}$1`');
console.log('Replaced single-quoted localhost fetch requests.');

// Backticks: `http://localhost:5000/api/...` -> `${API_BASE_URL}/api/...`
content = content.replace(/`http:\/\/localhost:5000([^`]+)`/g, '`${API_BASE_URL}$1`');
console.log('Replaced backtick-quoted localhost fetch requests.');

// 3. Replace ws://localhost:5000 with WS_BASE_URL
// Backticks: `ws://localhost:5000?token=...` -> `${WS_BASE_URL}?token=...`
content = content.replace(/`ws:\/\/localhost:5000([^`]+)`/g, '`${WS_BASE_URL}$1`');
console.log('Replaced WebSocket connection URLs.');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully wrote patched App.tsx!');
