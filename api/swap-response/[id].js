const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

// Global storage
global.events = global.events || [];
global.swapRequests = global.swapRequests || [];

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
    
    if (req.method === 'POST') {
      const { accept } = req.body;
      
      const requestIndex = global.swapRequests.findIndex(r => r.id === id);
      if (requestIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      const swapRequest = global.swapRequests[requestIndex];
      
      if (accept) {
        // Swap owners
        const mySlotIndex = global.events.findIndex(e => e.id === swapRequest.mySlotId);
        const theirSlotIndex = global.events.findIndex(e => e.id === swapRequest.theirSlotId);
        
        if (mySlotIndex !== -1 && theirSlotIndex !== -1) {
          const tempOwnerId = global.events[mySlotIndex].ownerId;
          global.events[mySlotIndex].ownerId = global.events[theirSlotIndex].ownerId;
          global.events[theirSlotIndex].ownerId = tempOwnerId;
          
          global.events[mySlotIndex].status = 'BUSY';
          global.events[theirSlotIndex].status = 'BUSY';
        }
        
        global.swapRequests[requestIndex].status = 'ACCEPTED';
      } else {
        // Revert statuses
        const mySlotIndex = global.events.findIndex(e => e.id === swapRequest.mySlotId);
        const theirSlotIndex = global.events.findIndex(e => e.id === swapRequest.theirSlotId);
        
        if (mySlotIndex !== -1) global.events[mySlotIndex].status = 'SWAPPABLE';
        if (theirSlotIndex !== -1) global.events[theirSlotIndex].status = 'SWAPPABLE';
        
        global.swapRequests[requestIndex].status = 'REJECTED';
      }
      
      return res.json({ message: accept ? 'Swap accepted' : 'Swap rejected' });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}