const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSwappableSlots = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'SWAPPABLE',
        ownerId: { not: req.userId }
      },
      include: { owner: { select: { name: true, email: true } } }
    });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createSwapRequest = async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    
    const theirSlot = await prisma.event.findUnique({
      where: { id: theirSlotId }
    });
    
    const swapRequest = await prisma.swapRequest.create({
      data: {
        mySlotId,
        theirSlotId,
        fromUserId: req.userId,
        toUserId: theirSlot.ownerId
      }
    });
    
    await prisma.event.updateMany({
      where: { id: { in: [mySlotId, theirSlotId] } },
      data: { status: 'SWAP_PENDING' }
    });
    
    res.json(swapRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const respondToSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;
    
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: id },
      include: { mySlot: true, theirSlot: true }
    });
    
    if (accept) {
      await prisma.$transaction([
        prisma.event.update({
          where: { id: swapRequest.mySlotId },
          data: { ownerId: swapRequest.toUserId, status: 'BUSY' }
        }),
        prisma.event.update({
          where: { id: swapRequest.theirSlotId },
          data: { ownerId: swapRequest.fromUserId, status: 'BUSY' }
        }),
        prisma.swapRequest.update({
          where: { id: id },
          data: { status: 'ACCEPTED' }
        })
      ]);
    } else {
      await prisma.$transaction([
        prisma.event.update({
          where: { id: swapRequest.mySlotId },
          data: { status: 'SWAPPABLE' }
        }),
        prisma.event.update({
          where: { id: swapRequest.theirSlotId },
          data: { status: 'SWAPPABLE' }
        }),
        prisma.swapRequest.update({
          where: { id: id },
          data: { status: 'REJECTED' }
        })
      ]);
    }
    
    res.json({ message: accept ? 'Swap accepted' : 'Swap rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSwapRequests = async (req, res) => {
  try {
    const [incoming, outgoing] = await Promise.all([
      prisma.swapRequest.findMany({
        where: { toUserId: req.userId },
        include: {
          mySlot: true,
          theirSlot: true,
          fromUser: { select: { name: true, email: true } }
        }
      }),
      prisma.swapRequest.findMany({
        where: { fromUserId: req.userId },
        include: {
          mySlot: true,
          theirSlot: true,
          toUser: { select: { name: true, email: true } }
        }
      })
    ]);
    
    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getSwappableSlots, createSwapRequest, respondToSwapRequest, getSwapRequests };