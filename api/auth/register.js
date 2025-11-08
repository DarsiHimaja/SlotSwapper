const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Global storage
global.users = global.users || [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = global.users.find(u => u.email === email);
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
    
    global.users.push(user);
    
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: userId, name, email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}