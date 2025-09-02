const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 80;
const subscribers = new Map(); // Store active SSE connections
let messageCounter = 0;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Last-Event-ID, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Mercure endpoint
  if (parsedUrl.pathname === '/.well-known/mercure') {
    if (req.method === 'GET') {
      // SSE connection
      const topic = parsedUrl.query.topic || '*';
      const clientId = Date.now() + '_' + Math.random();
      
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      
      // Store subscriber
      subscribers.set(clientId, { res, topic });
      
      // Send initial comment
      res.write(': Connected to Mercure\n\n');
      console.log(`New subscriber ${clientId} for topic: ${topic}`);
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        if (subscribers.has(clientId)) {
          res.write(': heartbeat\n\n');
        }
      }, 30000);
      
      // Clean up on close
      req.on('close', () => {
        clearInterval(heartbeat);
        subscribers.delete(clientId);
        console.log(`Subscriber ${clientId} disconnected`);
      });
      
      return;
    } else if (req.method === 'POST') {
      // Publishing endpoint
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = querystring.parse(body);
          const topic = data.topic;
          const messageData = data.data;
          
          console.log(`Publishing to topic: ${topic}`);
          console.log(`Data: ${messageData}`);
          
          // Broadcast to matching subscribers
          let sentCount = 0;
          subscribers.forEach((subscriber, clientId) => {
            if (subscriber.topic === '*' || subscriber.topic === topic) {
              const eventId = ++messageCounter;
              subscriber.res.write(`id: ${eventId}\n`);
              subscriber.res.write(`data: ${messageData}\n\n`);
              sentCount++;
            }
          });
          
          console.log(`Message sent to ${sentCount} subscribers`);
          
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`Message published to ${sentCount} subscribers`);
        } catch (error) {
          console.error('Error processing publish request:', error);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad Request');
        }
      });
      
      return;
    }
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mercure-like server running on port ${PORT}`);
});