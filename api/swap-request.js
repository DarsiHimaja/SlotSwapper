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
    
    if (req.method === 'POST') {
      const { mySlotId, theirSlotId } = req.body;
      
      const theirSlot = global.events.find(e => e.id === theirSlotId);
      if (!theirSlot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      
      const requestId = Date.now().toString();
      const swapRequest = {
        id: requestId,
        mySlotId,
        theirSlotId,
        fromUserId: userId,
        toUserId: theirSlot.ownerId,
        status: 'PENDING'
      };
      
      global.swapRequests.push(swapRequest);
      
      // Update event statuses to SWAP_PENDING
      const mySlotIndex = global.events.findIndex(e => e.id === mySlotId);
      const theirSlotIndex = global.events.findIndex(e => e.id === theirSlotId);
      
      if (mySlotIndex !== -1) global.events[mySlotIndex].status = 'SWAP_PENDING';
      if (theirSlotIndex !== -1) global.events[theirSlotIndex].status = 'SWAP_PENDING';
      
      return res.json(swapRequest);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}