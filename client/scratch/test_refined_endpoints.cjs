const http = require('http');

const request = (method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: responseBody ? JSON.parse(responseBody) : {}
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: responseBody
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(data);
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING REFINED BLACKROX PLATFORM ENDPOINT TESTS ---');

  try {
    // 1. Admin Login
    console.log('\n[TEST 1] Admin Login...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@back.com',
      password: 'Test@123'
    });
    console.log('Status:', adminLogin.statusCode);
    if (adminLogin.statusCode !== 200 || !adminLogin.body.token) {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLogin.body.token;
    console.log('Admin Token acquired.');

    // 2. Fetch Users List
    console.log('\n[TEST 2] Fetch Users Directory (Admin)...');
    const usersList = await request('GET', '/api/admin/users', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', usersList.statusCode);
    console.log('Users count:', usersList.body.length);
    if (usersList.statusCode !== 200) {
      throw new Error('Fetch users list failed');
    }

    // 3. Create a new user
    console.log('\n[TEST 3] Create Terminal User...');
    const newUserEmail = 'trader_' + Date.now() + '@back.com';
    const createUser = await request('POST', '/api/admin/users', {
      name: 'Retail Test Trader',
      email: newUserEmail,
      password: 'Test@123',
      role: 'user'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', createUser.statusCode);
    if (createUser.statusCode !== 201) {
      throw new Error('Create user failed');
    }
    const createdUserId = createUser.body.id;
    console.log('User created with ID:', createdUserId);

    // 4. Assign Plan to User
    console.log('\n[TEST 4] Assign Plan to User...');
    const assignPlan = await request('POST', '/api/admin/users/assign-plan', {
      userId: createdUserId,
      planId: 'plan_vip'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', assignPlan.statusCode);
    if (assignPlan.statusCode !== 200 || assignPlan.body.user.planId !== 'plan_vip') {
      throw new Error('Assign plan failed');
    }
    console.log('Plan successfully assigned.');

    // 5. Suspend User Access
    console.log(`\n[TEST 5] Suspend User Access for ID ${createdUserId}...`);
    const toggleSuspend = await request('POST', '/api/admin/users/toggle', { id: createdUserId }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', toggleSuspend.statusCode);
    if (toggleSuspend.statusCode !== 200 || toggleSuspend.body.status !== 'suspended') {
      throw new Error('Suspend user status toggle failed');
    }
    console.log('User suspended successfully.');

    // 6. Test suspended user login (should fail)
    console.log('\n[TEST 6] Login attempt with suspended user...');
    const suspendedLogin = await request('POST', '/api/auth/login', {
      email: newUserEmail,
      password: 'Test@123'
    });
    console.log('Status:', suspendedLogin.statusCode);
    if (suspendedLogin.statusCode !== 403) {
      throw new Error('Suspended user was allowed to log in! Expected 403.');
    }
    console.log('Suspended user block validated successfully.');

    // 7. Unsuspend User
    console.log(`\n[TEST 7] Authorize User Access for ID ${createdUserId}...`);
    const toggleAuthorize = await request('POST', '/api/admin/users/toggle', { id: createdUserId }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', toggleAuthorize.statusCode);
    if (toggleAuthorize.statusCode !== 200 || toggleAuthorize.body.status !== 'active') {
      throw new Error('Authorize user status toggle failed');
    }
    console.log('User authorized successfully.');

    // 8. Successful login with authorized user
    console.log('\n[TEST 8] Login with authorized user...');
    const userLogin = await request('POST', '/api/auth/login', {
      email: newUserEmail,
      password: 'Test@123'
    });
    console.log('Status:', userLogin.statusCode);
    if (userLogin.statusCode !== 200 || !userLogin.body.token) {
      throw new Error('Authorized user login failed');
    }
    const userToken = userLogin.body.token;
    console.log('User Token acquired.');

    // 9. Update Lot size multiplier
    console.log('\n[TEST 9] Update Lot size multiplier to 3.5x...');
    const updateMultiplier = await request('POST', '/api/user/settings', {
      lotMultiplier: 3.5
    }, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', updateMultiplier.statusCode);
    if (updateMultiplier.statusCode !== 200 || updateMultiplier.body.lotMultiplier !== 3.5) {
      throw new Error('Lot multiplier update failed');
    }
    console.log('Multiplier updated successfully.');

    // 10. Update Risk settings
    console.log('\n[TEST 10] Update Risk settings...');
    const updateRisk = await request('POST', '/api/user/risk-settings', {
      defaultLotSize: 3,
      dailyRiskLimit: 15000,
      stopLossPct: 1.5,
      targetPct: 3.0,
      maxOpenTrades: 4
    }, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', updateRisk.statusCode);
    if (updateRisk.statusCode !== 200 || updateRisk.body.riskSettings.stopLossPct !== 1.5) {
      throw new Error('Risk settings update failed');
    }
    console.log('Risk settings updated successfully.');

    // 11. Connect Broker Account
    console.log('\n[TEST 11] Connect Broker Account...');
    const connectBroker = await request('POST', '/api/credentials', {
      broker: 'Zerodha Kite',
      name: 'My Kite Live',
      apiKey: 'kitekey123456789',
      userId: 'AB1234'
    }, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', connectBroker.statusCode);
    if (connectBroker.statusCode !== 201) {
      throw new Error('Broker connection failed');
    }
    const brokerCredId = connectBroker.body.id;
    console.log('Broker connected. ID:', brokerCredId);

    // 12. Fetch credentials as User (should be 1)
    console.log('\n[TEST 12] Fetch credentials as User (should only return theirs)...');
    const userCreds = await request('GET', '/api/credentials', null, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', userCreds.statusCode);
    console.log('User Credentials Count:', userCreds.body.length);
    if (userCreds.statusCode !== 200 || userCreds.body.length !== 1) {
      throw new Error('Credentials isolation check failed for user');
    }

    // 13. Reset user API from Admin
    console.log('\n[TEST 13] Reset User API Credentials (Admin)...');
    const resetApi = await request('POST', '/api/admin/users/reset-api', {
      id: createdUserId
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', resetApi.statusCode);
    if (resetApi.statusCode !== 200) {
      throw new Error('Reset API failed');
    }

    // 14. Fetch credentials as User again (should be 0)
    console.log('\n[TEST 14] Fetch credentials as User after Admin reset...');
    const userCredsAfterReset = await request('GET', '/api/credentials', null, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', userCredsAfterReset.statusCode);
    console.log('User Credentials Count:', userCredsAfterReset.body.length);
    if (userCredsAfterReset.statusCode !== 200 || userCredsAfterReset.body.length !== 0) {
      throw new Error('Reset credentials validation failed');
    }

    console.log('\n🌟 ALL ENDPOINT TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
