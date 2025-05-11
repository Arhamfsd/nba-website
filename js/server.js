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

// Chat Schema
const chatSchema = new mongoose.Schema({
    userEmail: String,
    message: String,
    isUser: Boolean,
    timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema, 'chat_messages');

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

// Chat message endpoint
app.post('/chat', async (req, res) => {
    if (!isLoggedIn || !userEmail) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    try {
        const { message } = req.body;

        // Save user message
        const userMessage = new Chat({
            userEmail,
            message,
            isUser: true
        });
        await userMessage.save();

        // Generate response based on message content
        let responseMessage = "Thank you for your message. How can I help you further?";
        
        // Simple keyword-based responses
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            responseMessage = "Hello! How can I assist you today?";
        } else if (lowerMessage.includes('score') || lowerMessage.includes('game')) {
            responseMessage = "You can check the latest scores on our Live Score page!";
        } else if (lowerMessage.includes('team') || lowerMessage.includes('favorite')) {
            responseMessage = "You can update your favorite team in your profile settings.";
        } else if (lowerMessage.includes('help')) {
            responseMessage = "I can help you with scores, team information, and general queries. What would you like to know?";
        }

        // Save bot response
        const botMessage = new Chat({
            userEmail,
            message: responseMessage,
            isUser: false
        });
        await botMessage.save();

        res.json({
            userMessage: {
                message,
                timestamp: userMessage.timestamp
            },
            botMessage: {
                message: responseMessage,
                timestamp: botMessage.timestamp
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get chat history endpoint
app.get('/chat-history', async (req, res) => {
    if (!isLoggedIn || !userEmail) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    try {
        const messages = await Chat.find({ userEmail })
            .sort({ timestamp: 1 })
            .limit(10); // Get last 10 messages
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
