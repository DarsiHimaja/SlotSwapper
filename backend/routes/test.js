const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/db-test', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;