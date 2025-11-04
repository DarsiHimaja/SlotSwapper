const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const router = express.Router();
const JWT_SECRET = 'your-secret-key';

// Test route without auth
router.get('/test', async (req, res) => {
  try {
    res.json({ status: 'Server working', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple register test
router.post('/test-register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const MONGODB_URI = process.env.DATABASE_URL;
    if (!MONGODB_URI) {
      return res.status(500).json({ error: 'No database URL' });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('slotswapper');
    const users = db.collection('users');
    
    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      await client.close();
      return res.status(400).json({ error: 'Email exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    await client.close();
    
    const token = jwt.sign({ userId: result.insertedId }, JWT_SECRET);
    res.json({ 
      success: true,
      token, 
      user: { id: result.insertedId, name, email } 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

module.exports = router;