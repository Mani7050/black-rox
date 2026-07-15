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
  console.log('--- STARTING BLACKROX PRODUCTION ENDPOINT TESTS ---');

  try {
    // 1. Admin Login
    console.log('\n[TEST 1] Admin Login...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@back.com',
      password: 'Test@123'
    });
    console.log('Status:', adminLogin.statusCode);
    console.log('Response:', adminLogin.body);
    if (adminLogin.statusCode !== 200 || !adminLogin.body.token) {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLogin.body.token;

    // 2. Fetch Users List
    console.log('\n[TEST 2] Fetch Users Directory (Admin Authorized)...');
    const usersList = await request('GET', '/api/admin/users', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', usersList.statusCode);
    console.log('Users count:', usersList.body.length);
    console.log('Users list:', usersList.body);
    if (usersList.statusCode !== 200) {
      throw new Error('Fetch users failed');
    }

    // 3. Create a new user
    console.log('\n[TEST 3] Create Terminal Account...');
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
    console.log('Created User:', createUser.body);
    if (createUser.statusCode !== 201) {
      throw new Error('Create user failed');
    }
    const createdUserId = createUser.body.id;

    // 4. Toggle User Status (Suspend Access)
    console.log(`\n[TEST 4] Suspend User Access for ID ${createdUserId}...`);
    const toggleSuspend = await request('POST', `/api/admin/users/toggle`, { id: createdUserId }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', toggleSuspend.statusCode);
    console.log('Response:', toggleSuspend.body);
    if (toggleSuspend.statusCode !== 200 || toggleSuspend.body.status !== 'suspended') {
      throw new Error('Suspend user status toggle failed');
    }

    // 5. Test suspended user login (should fail)
    console.log('\n[TEST 5] Login attempt with suspended user...');
    const suspendedLogin = await request('POST', '/api/auth/login', {
      email: newUserEmail,
      password: 'Test@123'
    });
    console.log('Status:', suspendedLogin.statusCode);
    console.log('Response:', suspendedLogin.body);
    if (suspendedLogin.statusCode === 200) {
      throw new Error('Suspended user was allowed to log in!');
    }

    // 6. Unsuspend User
    console.log(`\n[TEST 6] Authorize User Access for ID ${createdUserId}...`);
    const toggleAuthorize = await request('POST', `/api/admin/users/toggle`, { id: createdUserId }, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Status:', toggleAuthorize.statusCode);
    console.log('Response:', toggleAuthorize.body);
    if (toggleAuthorize.statusCode !== 200 || toggleAuthorize.body.status !== 'active') {
      throw new Error('Authorize user status toggle failed');
    }

    // 7. Successful login with authorized user
    console.log('\n[TEST 7] Login with authorized user...');
    const userLogin = await request('POST', '/api/auth/login', {
      email: newUserEmail,
      password: 'Test@123'
    });
    console.log('Status:', userLogin.statusCode);
    console.log('Response:', userLogin.body);
    if (userLogin.statusCode !== 200 || !userLogin.body.token) {
      throw new Error('Authorized user login failed');
    }
    const userToken = userLogin.body.token;

    // 8. Update Lot size multiplier
    console.log('\n[TEST 8] Update Lot size multiplier to 3.5x...');
    const updateMultiplier = await request('POST', '/api/user/settings', {
      lotMultiplier: 3.5
    }, {
      'Authorization': `Bearer ${userToken}`
    });
    console.log('Status:', updateMultiplier.statusCode);
    console.log('Response:', updateMultiplier.body);
    if (updateMultiplier.statusCode !== 200 || updateMultiplier.body.lotMultiplier !== 3.5) {
      throw new Error('Lot multiplier update failed');
    }

    console.log('\n🌟 ALL ENDPOINT TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
