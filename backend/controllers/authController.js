const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Create demo user with correct password hash
const createDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  return {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@gmail.com',
    password: hashedPassword,
    createdAt: new Date()
  };
};

// Simple in-memory storage (for demo purposes)
let users = [];
let events = [
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
let swapRequests = [];

// Initialize demo user
(async () => {
  users.push(await createDemoUser());
})();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: userId, name, email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.find(u => u.email === email);
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
};

module.exports = { register, login, users, events, swapRequests };