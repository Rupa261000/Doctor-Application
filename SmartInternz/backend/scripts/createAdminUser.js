const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userSchema = require('../schemas/userModel');

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/yourdbname';

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');

  const existingAdmin = await userSchema.findOne({ type: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    process.exit(0);
  }

  const adminUser = new userSchema({
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // You should hash this password in production
    phone: '1234567890',
    address: 'Admin Address',
    type: 'admin',
    notification: [],
    seennotification: [],
  });

  await adminUser.save();
  console.log('Admin user created successfully with email: admin@example.com and password: admin123');
  process.exit(0);
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});
