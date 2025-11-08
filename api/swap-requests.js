const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

// Global storage
global.events = global.events || [];
global.swapRequests = global.swapRequests || [];
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
      const incoming = global.swapRequests.filter(r => r.toUserId === userId);
      const outgoing = global.swapRequests.filter(r => r.fromUserId === userId);
      
      // Add event and user details
      const enrichRequests = (requests) => requests.map(request => {
        const mySlot = global.events.find(e => e.id === request.mySlotId);
        const theirSlot = global.events.find(e => e.id === request.theirSlotId);
        const fromUser = global.users.find(u => u.id === request.fromUserId);
        const toUser = global.users.find(u => u.id === request.toUserId);
        
        return {
          ...request,
          mySlot,
          theirSlot,
          fromUser: { name: fromUser?.name, email: fromUser?.email },
          toUser: { name: toUser?.name, email: toUser?.email }
        };
      });
      
      return res.json({ 
        incoming: enrichRequests(incoming), 
        outgoing: enrichRequests(outgoing) 
      });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}