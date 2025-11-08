const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

// Global storage
global.events = global.events || [];
global.users = global.users || [];

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
      const swappableEvents = global.events.filter(event => 
        event.status === 'SWAPPABLE' && event.ownerId !== userId
      );
      
      const eventsWithOwner = swappableEvents.map(event => {
        const owner = global.users.find(u => u.id === event.ownerId);
        return {
          ...event,
          owner: { name: owner?.name, email: owner?.email }
        };
      });
      
      return res.json(eventsWithOwner);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}