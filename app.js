const mongoose = require('mongoose');

// 1. CONNECT TO MONGODB
// 'eventPlannerDB' is the name of your database. It will be created automatically.
const MONGO_URI = 'mongodb://127.0.0.1:27017/eventPlannerDB';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));

// 2. DEFINE THE SCHEMAS (The Structure)

// A. User Schema
const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  role: { type: String, enum: ['CLIENT', 'ADMIN'], default: 'CLIENT' }
});
const User = mongoose.model('User', userSchema);

// B. Worker Schema
const workerSchema = new mongoose.Schema({
  name: String,
  skill: String, // e.g., DJ, Photographer
  hourly_rate: Number
});
const Worker = mongoose.model('Worker', workerSchema);

// C. Inventory Schema
const inventorySchema = new mongoose.Schema({
  item_name: String,
  price: Number
});
const Inventory = mongoose.model('Inventory', inventorySchema);

// D. Event Schema (The Master Plan)
const eventSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event_name: String,
  date: Date,
  status: String,
  
  // EMBEDDED ARRAYS
  booked_decor: [{
    item_name: String,
    quantity: Number,
    cost: Number
  }],
  booked_workers: [{
    worker_name: String,
    hours: Number,
    cost: Number
  }]
});
const Event = mongoose.model('Event', eventSchema);

// 3. CREATE DATA (Function to populate the DB)
async function createData() {
  
  // A. Clear old data (Optional, just to keep things clean while testing)
  await Event.deleteMany({});
  await User.deleteMany({});

  // B. Create a Client
  const client = await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    role: "CLIENT"
  });

  // C. Create an Event with Embedded Decorations and Workers
  const newEvent = await Event.create({
    client_id: client._id,
    event_name: "John's Birthday Bash",
    date: new Date('2024-12-31'),
    status: "PLANNING",
    
    // We push data directly into the arrays here
    booked_decor: [
      { item_name: "Disco Ball", quantity: 1, cost: 50 },
      { item_name: "Party Streamers", quantity: 10, cost: 20 }
    ],
    
    booked_workers: [
      { worker_name: "DJ Mike", hours: 4, cost: 200 },
      { worker_name: "Clown Bob", hours: 2, cost: 150 }
    ]
  });

  console.log("✅ Event Created!");
  console.log(newEvent);

  // D. Close the connection
  mongoose.connection.close();
}

// 4. RUN THE FUNCTION
createData();