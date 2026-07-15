const fs = require('fs');
const c = fs.readFileSync('src/App.tsx', 'utf8');
const tabs = [
  'admin_brokers','admin_trading','admin_risk','admin_signals',
  'admin_payments','admin_reports','admin_notifications','admin_settings','admin_audit'
];
tabs.forEach(t => {
  const search = "activeTab === '" + t + "'";
  const idx = c.indexOf(search);
  if (idx > 0) {
    const line = c.substring(0, idx).split('\n').length;
    console.log(t, '-> line', line);
  } else {
    console.log(t, '-> NOT FOUND');
  }
});
