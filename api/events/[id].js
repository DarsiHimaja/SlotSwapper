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
    const { id } = req.query;
    
    if (req.method === 'PUT') {
      const { title, startTime, endTime, status } = req.body;
      const eventIndex = global.events.findIndex(e => e.id === id && e.ownerId === userId);
      
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (title) global.events[eventIndex].title = title;
      if (startTime) global.events[eventIndex].startTime = new Date(startTime);
      if (endTime) global.events[eventIndex].endTime = new Date(endTime);
      if (status) global.events[eventIndex].status = status;
      
      return res.json(global.events[eventIndex]);
    }
    
    if (req.method === 'DELETE') {
      const eventIndex = global.events.findIndex(e => e.id === id && e.ownerId === userId);
      
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      global.events.splice(eventIndex, 1);
      return res.json({ message: 'Event deleted' });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}