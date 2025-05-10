const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Single global login state
let isLoggedIn = false;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/Nba', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    favouriteTeam: String
});

const User = mongoose.model('User', userSchema,'Nba_login');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS for frontend use
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Check Login Status
app.get('/check-login', (req, res) => {
    res.json({ isLoggedIn });
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set global login state
        isLoggedIn = true;

        res.status(200).json({ 
            message: `Welcome, ${user.name}`,
            user: {
                name: user.name,
                email: user.email,
                favouriteTeam: user.favouriteTeam
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    isLoggedIn = false;
    res.json({ message: 'Logged out successfully' });
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { name, email, password, favouriteTeam } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email, password, favouriteTeam });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Leaderboard GET
app.get('/leaderboard', (req, res) => {
    const leaderboardData = {
        mvp: ["Player Abc", "Player B", "Player C"],
        topScorer: ["Player Xyz", "Player Y", "Player Z"],
        rookie: ["Player Lebron", "Player M", "Player N"],
        east: ["Team miami", "Team B", "Team Z"],
        west: ["Team laker", "Team Y", "Team Z"]
    };
    res.status(200).json(leaderboardData);
});

// Feedback POST
app.post('/feedback', (req, res) => {
    console.log('Received Feedback:', req.body);
    res.status(200).json({ message: 'Feedback received successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
