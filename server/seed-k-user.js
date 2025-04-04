import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Create a specific user
    const kEmail = 'k@k.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: kEmail });
    if (existingUser) {
      console.log('User k@k.com already exists');
      
      // Update password for existing user
      const hashedPassword = await bcrypt.hash('password123', 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Password updated for k@k.com');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create new user
      const newUser = new User({
        name: 'K User',
        email: kEmail,
        password: hashedPassword
      });
      
      await newUser.save();
      console.log('User k@k.com created successfully');
    }
    
    // List all users
    const users = await User.find({}).select('email name');
    console.log('Current users in database:');
    console.log(users);
    
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase(); 