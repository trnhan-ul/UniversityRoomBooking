// Server entry point
const express = require('express');
const cors = require("cors");
require('dotenv').config();

// Fail fast if JWT secret is not provided
if (!process.env.JWT_SECRET) {
    console.error('Environment variable JWT_SECRET is required');
    process.exit(1);
}

const connectDB = require("./config/db");
const initDatabase = require("./config/init");

const app = express();

// Connect to database and initialize
connectDB().then(async () => {
    await initDatabase();
    console.log('Database initialized');
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'University Room Booking System API',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
