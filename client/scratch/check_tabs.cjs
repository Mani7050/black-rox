const fs = require('fs');
const c = fs.readFileSync('src/App.tsx', 'utf8');
const tabs = [
  'admin_dashboard','admin_users','admin_subscriptions','admin_brokers',
  'admin_trading','admin_risk','admin_signals','admin_payments',
  'admin_reports','admin_notifications','admin_settings','admin_audit'
];
tabs.forEach(t => {
  const found = c.includes("activeTab === '" + t + "'");
  console.log((found ? '[YES]' : '[NO] '), t);
});
