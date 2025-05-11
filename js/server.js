const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Single global login state
let isLoggedIn = false;
let userEmail = '';

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

const User = mongoose.model('User', userSchema, 'Nba_login');

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: { type: String, required: true },
    status: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedback');

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

// Get User Info Route
app.get('/userinfo', async (req, res) => {
    if (!isLoggedIn || !userEmail) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            favouriteTeam: user.favouriteTeam
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update Profile Route
app.post('/update-profile', async (req, res) => {
    if (!isLoggedIn || !userEmail) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    try {
        const { name, email, favouriteTeam, currentPassword, newPassword } = req.body;

        // Check if new email is already taken by another user
        if (email !== userEmail) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // If password update is requested
        if (currentPassword && newPassword) {
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password
            if (user.password !== currentPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Update user with new password
            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                { name, email, favouriteTeam, password: newPassword },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update global email if email was changed
            if (email !== userEmail) {
                userEmail = email;
            }

            res.json({
                message: 'Profile and password updated successfully',
                user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    favouriteTeam: updatedUser.favouriteTeam
                }
            });
        } else {
            // Regular profile update without password change
            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                { name, email, favouriteTeam },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update global email if email was changed
            if (email !== userEmail) {
                userEmail = email;
            }

            res.json({
                message: 'Profile updated successfully',
                user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    favouriteTeam: updatedUser.favouriteTeam
                }
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
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
        userEmail = user.email;
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
    userEmail = '';
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
app.post('/feedback', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Log the received data for debugging
        console.log('Received feedback data:', { name, email, message });

        const newFeedback = new Feedback({
            name,
            email,
            message,
            status: false,
            date: new Date()
        });

        const savedFeedback = await newFeedback.save();
        
        res.status(200).json({ message: 'Feedback received successfully!' });
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
