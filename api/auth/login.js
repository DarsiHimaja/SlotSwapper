const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Global storage
global.users = global.users || [];

// Initialize demo user synchronously
if (!global.demoInitialized) {
  global.demoInitialized = true;
  bcrypt.hash('demo123', 10).then(hashedPassword => {
    global.users.push({
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@gmail.com',
      password: hashedPassword,
      createdAt: new Date()
    });
    
    // Add demo events
    global.events = global.events || [];
    global.events.push(
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
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = global.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}