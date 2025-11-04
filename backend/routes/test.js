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

module.exports = router;