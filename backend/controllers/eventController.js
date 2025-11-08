const { getStorage } = require('../data/storage');

const getEvents = async (req, res) => {
  try {
    const storage = await getStorage();
    const userEvents = storage.events.filter(event => event.ownerId === req.userId);
    res.json(userEvents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    const eventId = Date.now().toString();
    
    const storage = await getStorage();
    
    const event = {
      id: eventId,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || 'BUSY',
      ownerId: req.userId
    };
    
    storage.events.push(event);
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, status } = req.body;
    
    const storage = await getStorage();
    const eventIndex = storage.events.findIndex(e => e.id === id && e.ownerId === req.userId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (title) storage.events[eventIndex].title = title;
    if (startTime) storage.events[eventIndex].startTime = new Date(startTime);
    if (endTime) storage.events[eventIndex].endTime = new Date(endTime);
    if (status) storage.events[eventIndex].status = status;
    
    res.json(storage.events[eventIndex]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const storage = await getStorage();
    const eventIndex = storage.events.findIndex(e => e.id === id && e.ownerId === req.userId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    storage.events.splice(eventIndex, 1);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };