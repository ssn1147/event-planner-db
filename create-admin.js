const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Connect
mongoose.connect('mongodb://127.0.0.1:27017/eventPlannerDB');

// 2. Define User Schema (Must match your DB structure)
const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  password_hash: String,
  role: String
});

const User = mongoose.model('User', userSchema);

// 3. Create Admin
async function createAdmin() {
  // Hash the password "admin123"
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new User({
    full_name: 'Super Admin',
    email: 'admin@event.com',
    password_hash: hashedPassword, // Save the SCRAMBLED password
    role: 'ADMIN'
  });

  await admin.save();
  console.log('✅ Admin created!');
  console.log('Email: admin@event.com');
  console.log('Password: admin123');
  mongoose.connection.close();
}

createAdmin();