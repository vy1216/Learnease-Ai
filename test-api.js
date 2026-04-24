const http = require('http');

const data = JSON.stringify({ user: 'test groq error capture' });
const opts = {
  hostname: '127.0.0.1',
  port: 3002,
  path: '/api/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(opts, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP STATUS:', res.statusCode);
    console.log('RESPONSE:', body);
    process.exit(0);
  });
});

req.on('error', err => {
  console.error('REQUEST ERROR:', err.message);
  process.exit(1);
});

req.write(data);
req.end();

setTimeout(() => {
  console.error('TIMEOUT - no response after 15s');
  process.exit(1);
}, 15000);
