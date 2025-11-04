const { events, swapRequests, users } = require('./authController');

const getSwappableSlots = async (req, res) => {
  try {
    const swappableEvents = events.filter(event => 
      event.status === 'SWAPPABLE' && event.ownerId !== req.userId
    );
    
    const eventsWithOwner = swappableEvents.map(event => {
      const owner = users.find(u => u.id === event.ownerId);
      return {
        ...event,
        owner: { name: owner?.name, email: owner?.email }
      };
    });
    
    res.json(eventsWithOwner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createSwapRequest = async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    
    const theirSlot = events.find(e => e.id === theirSlotId);
    if (!theirSlot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    const requestId = Date.now().toString();
    const swapRequest = {
      id: requestId,
      mySlotId,
      theirSlotId,
      fromUserId: req.userId,
      toUserId: theirSlot.ownerId,
      status: 'PENDING'
    };
    
    swapRequests.push(swapRequest);
    
    // Update event statuses
    const mySlotIndex = events.findIndex(e => e.id === mySlotId);
    const theirSlotIndex = events.findIndex(e => e.id === theirSlotId);
    
    if (mySlotIndex !== -1) events[mySlotIndex].status = 'SWAP_PENDING';
    if (theirSlotIndex !== -1) events[theirSlotIndex].status = 'SWAP_PENDING';
    
    res.json(swapRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const respondToSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;
    
    const requestIndex = swapRequests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const swapRequest = swapRequests[requestIndex];
    
    if (accept) {
      // Swap owners
      const mySlotIndex = events.findIndex(e => e.id === swapRequest.mySlotId);
      const theirSlotIndex = events.findIndex(e => e.id === swapRequest.theirSlotId);
      
      if (mySlotIndex !== -1 && theirSlotIndex !== -1) {
        const tempOwnerId = events[mySlotIndex].ownerId;
        events[mySlotIndex].ownerId = events[theirSlotIndex].ownerId;
        events[theirSlotIndex].ownerId = tempOwnerId;
        
        events[mySlotIndex].status = 'BUSY';
        events[theirSlotIndex].status = 'BUSY';
      }
      
      swapRequests[requestIndex].status = 'ACCEPTED';
    } else {
      // Revert statuses
      const mySlotIndex = events.findIndex(e => e.id === swapRequest.mySlotId);
      const theirSlotIndex = events.findIndex(e => e.id === swapRequest.theirSlotId);
      
      if (mySlotIndex !== -1) events[mySlotIndex].status = 'SWAPPABLE';
      if (theirSlotIndex !== -1) events[theirSlotIndex].status = 'SWAPPABLE';
      
      swapRequests[requestIndex].status = 'REJECTED';
    }
    
    res.json({ message: accept ? 'Swap accepted' : 'Swap rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSwapRequests = async (req, res) => {
  try {
    const incoming = swapRequests.filter(r => r.toUserId === req.userId);
    const outgoing = swapRequests.filter(r => r.fromUserId === req.userId);
    
    // Add event and user details
    const enrichRequests = (requests) => requests.map(request => {
      const mySlot = events.find(e => e.id === request.mySlotId);
      const theirSlot = events.find(e => e.id === request.theirSlotId);
      const fromUser = users.find(u => u.id === request.fromUserId);
      const toUser = users.find(u => u.id === request.toUserId);
      
      return {
        ...request,
        mySlot,
        theirSlot,
        fromUser: { name: fromUser?.name, email: fromUser?.email },
        toUser: { name: toUser?.name, email: toUser?.email }
      };
    });
    
    res.json({ 
      incoming: enrichRequests(incoming), 
      outgoing: enrichRequests(outgoing) 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getSwappableSlots, createSwapRequest, respondToSwapRequest, getSwapRequests };