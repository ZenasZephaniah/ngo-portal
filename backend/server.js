const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables immediately at the very top
dotenv.config();

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth.routes.js');
const donationRoutes = require('./routes/donation.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running smoothly' });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});