#!/usr/bin/env node

// Debug script to see what IP the pentest is using
const http = require('http');

async function checkIP() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', body);
        resolve();
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify({ email: 'test@test.com', password: 'test' }));
    req.end();
  });
}

console.log('Testing login endpoint to see response...\n');
checkIP().then(() => {
  console.log('\nIf you see 403, the IP blocker is still blocking.');
  console.log('If you see 401 or 400, the IP blocker is working correctly.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
