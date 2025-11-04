const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Test route without auth
router.get('/test', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'Database connected successfully', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Push database schema
router.get('/setup-db', async (req, res) => {
  try {
    // This will create the collections in MongoDB
    await prisma.user.findMany();
    await prisma.event.findMany();
    await prisma.swapRequest.findMany();
    res.json({ status: 'Database schema initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;