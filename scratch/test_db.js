const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

async function test() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
