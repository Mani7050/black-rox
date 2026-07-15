const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Mani/black-rox/client/src/App.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('showAddUserModal') || line.includes('Create User Account')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
