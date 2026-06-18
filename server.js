const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'my_super_secret_event_key'; // Keep this safe!

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect('mongodb+srv://admin:ENG21CRO@cluster0.kigr1hu.mongodb.net/eventPlannerDB?appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));

// --- SCHEMAS ---

// 1. User Schema (Needed for Login)
const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  password_hash: String,
  role: String
});
const User = mongoose.model('User', userSchema);

// 2. Event Schema
const eventSchema = new mongoose.Schema({
  client_id: String,
  event_name: String,
  date: Date,
  status: String,
  booked_decor: Array,
  booked_workers: Array
});
const Event = mongoose.model('Event', eventSchema);

// --- MIDDLEWARE (The Guard) ---
// This function runs BEFORE the protected routes
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // The token is sent as "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });

    // Check if the user is actually an ADMIN
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access Denied: Not an Admin' });
    }

    req.user = user; // Attach user info to the request
    next(); // Allow the request to proceed
  });
}

// --- ROUTES ---

// 1. LOGIN ROUTE (Public)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  // Check password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

  // Generate Token
  const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// 2. GET ALL EVENTS (PROTECTED - Admin Only)
// Notice we added 'authenticateAdmin' as the second argument
app.get('/events', authenticateAdmin, async (req, res) => {
  try {
    const allEvents = await Event.find();
    res.json(allEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE EVENT (Public - For now, or add protection later)
app.post('/events', async (req, res) => {
  const eventData = req.body;
  const newEvent = new Event(eventData);
  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});