const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const swapRoutes = require('./routes/swaps');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['https://slot-swapper.vercel.app', 'https://slot-swapper-nl1f7ps46-himajas-projects.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});