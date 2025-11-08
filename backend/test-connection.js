// quick test to see if backend is working
// run with: node test-connection.js (from backend folder)

const API_BASE = 'http://localhost:3000/dev';

async function testConnection() {
  console.log('🧪 Testing backend connection...\n');

  try {
    // test 1: health check (no auth needed)
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${API_BASE}/`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Endpoints available:', Object.keys(healthData.endpoints || {}).length);
    
    // test 2: try to get requests (will fail without auth but shows connection works)
    console.log('\n2. Testing API connection (will fail without auth, but that\'s ok)...');
    const requestsRes = await fetch(`${API_BASE}/requests?city=toronto&region=ontario`);
    console.log('   Status:', requestsRes.status);
    
    if (requestsRes.status === 401) {
      console.log('✅ Backend is responding! (401 = needs auth, which is expected)');
    } else if (requestsRes.status === 200) {
      console.log('✅ Backend is working!');
    } else {
      const text = await requestsRes.text();
      console.log('   Response:', text.substring(0, 200));
    }

    console.log('\n✅ Connection test complete!');
    console.log('\nNext steps:');
    console.log('1. Backend is running at:', API_BASE);
    console.log('2. Frontend needs to configure API base URL');
    console.log('3. Frontend needs Cognito auth to call protected endpoints');
    console.log('4. See docs/API.md for endpoint details');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nMake sure backend is running:');
    console.log('  npm run dev');
  }
}

testConnection();

