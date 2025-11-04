const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { ownerId: req.userId }
    });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    const event = await prisma.event.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status || 'BUSY',
        ownerId: req.userId
      }
    });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, status } = req.body;
    
    const event = await prisma.event.update({
      where: { id: id, ownerId: req.userId },
      data: {
        ...(title && { title }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status })
      }
    });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({
      where: { id: id, ownerId: req.userId }
    });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };