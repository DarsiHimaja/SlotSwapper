const express = require('express');
const { getSwappableSlots, createSwapRequest, respondToSwapRequest, getSwapRequests } = require('../controllers/swapController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', createSwapRequest);
router.post('/swap-response/:id', respondToSwapRequest);
router.get('/swap-requests', getSwapRequests);

module.exports = router;