const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

// Global storage
global.events = global.events || [];

function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) throw new Error('Access token required');
  
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export default async function handler(req, res) {
  try {
    const userId = authenticateToken(req);
    
    if (req.method === 'GET') {
      const userEvents = global.events.filter(event => event.ownerId === userId);
      return res.json(userEvents);
    }
    
    if (req.method === 'POST') {
      const { title, startTime, endTime, status } = req.body;
      const eventId = Date.now().toString();
      
      const event = {
        id: eventId,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'BUSY',
        ownerId: userId
      };
      
      global.events.push(event);
      return res.json(event);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}