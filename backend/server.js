require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- 1. IMPORT CORS
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Connect to database
connectDB();

const app = express();

// --- Middleware ---
app.use(cors()); // <-- 2. USE CORS (This allows your frontend to make requests)
app.use(express.json()); // This lets our app accept JSON data
// --------------------

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Garbage Reporting System API is running...');
});

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});