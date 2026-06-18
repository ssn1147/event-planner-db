const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/eventPlannerDB');

const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  password_hash: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createClient() {
  // Hash the password "client123"
  const hashedPassword = await bcrypt.hash('client123', 10);

  const client = new User({
    full_name: 'Jane Doe',
    email: 'client@test.com',
    password_hash: hashedPassword,
    role: 'CLIENT'
  });

  await client.save();
  console.log('✅ Client User created!');
  console.log('Email: client@test.com');
  console.log('Password: client123');
  console.log('Role: CLIENT');
  mongoose.connection.close();
}

createClient();