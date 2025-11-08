const bcrypt = require('bcryptjs');

// Global storage that persists across requests
global.appData = global.appData || {
  users: [],
  events: [],
  swapRequests: [],
  initialized: false
};

const initializeData = async () => {
  if (!global.appData.initialized) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    global.appData.users = [{
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@gmail.com',
      password: hashedPassword,
      createdAt: new Date()
    }];
    
    global.appData.events = [
      {
        id: 'demo-event-1',
        title: 'Morning Meeting',
        startTime: new Date('2024-11-05T09:00:00'),
        endTime: new Date('2024-11-05T10:00:00'),
        status: 'SWAPPABLE',
        ownerId: 'demo-user-123'
      },
      {
        id: 'demo-event-2',
        title: 'Lunch Break',
        startTime: new Date('2024-11-05T12:00:00'),
        endTime: new Date('2024-11-05T13:00:00'),
        status: 'BUSY',
        ownerId: 'demo-user-123'
      }
    ];
    
    global.appData.swapRequests = [];
    global.appData.initialized = true;
  }
};

const getStorage = async () => {
  await initializeData();
  return global.appData;
};

module.exports = { getStorage };