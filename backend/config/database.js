// backend/config/database.js
const mongoose = require('mongoose');

// Database connection configuration
const connectDB = async () => {
  try {
    // MongoDB connection options for better performance and reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log specific error details for debugging
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Possible solutions:');
      console.error('   1. Check if MongoDB is running locally');
      console.error('   2. Verify MONGODB_URI in .env file');
      console.error('   3. Check network connectivity');
      console.error('   4. Verify database credentials');
    }
    
    process.exit(1);
  }
};

// Database health check function
const checkDBHealth = async () => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };
    } else {
      return {
        status: 'unhealthy',
        connected: false,
        readyState: mongoose.connection.readyState,
        message: 'Database not connected'
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
  }
};

// Function to seed initial admin user (optional)
const seedAdminUser = async () => {
  try {
    const User = require('../models/User');
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@library.com' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Library Administrator',
        email: 'admin@library.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'Admin'
      });
      
      await adminUser.save();
      console.log('👤 Default admin user created');
      console.log('📧 Email: admin@library.com');
      console.log('🔑 Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

// Function to seed sample books (optional)
const seedSampleBooks = async () => {
  try {
    const Book = require('../models/Book');
    const User = require('../models/User');
    
    // Get admin user to set as book creator
    const adminUser = await User.findOne({ role: 'Admin' });
    
    if (!adminUser) {
      console.log('⚠️ No admin user found, skipping book seeding');
      return;
    }

    // Check if books already exist
    const bookCount = await Book.countDocuments();
    
    if (bookCount === 0) {
      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0-7432-7356-5',
          genre: 'Classic Literature',
          description: 'A classic American novel set in the Jazz Age.',
          publishedYear: 1925,
          totalCopies: 5,
          availableCopies: 5,
          addedBy: adminUser._id
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '978-0-06-112008-4',
          genre: 'Classic Literature',
          description: 'A gripping tale of racial injustice and childhood innocence.',
          publishedYear: 1960,
          totalCopies: 3,
          availableCopies: 3,
          addedBy: adminUser._id
        },
        {
          title: '1984',
          author: 'George Orwell',
          isbn: '978-0-452-28423-4',
          genre: 'Dystopian Fiction',
          description: 'A dystopian social science fiction novel.',
          publishedYear: 1949,
          totalCopies: 4,
          availableCopies: 4,
          addedBy: adminUser._id
        },
        {
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          isbn: '978-0-14-143951-8',
          genre: 'Romance',
          description: 'A romantic novel of manners written by Jane Austen.',
          publishedYear: 1813,
          totalCopies: 6,
          availableCopies: 6,
          addedBy: adminUser._id
        },
        {
          title: 'The Catcher in the Rye',
          author: 'J.D. Salinger',
          isbn: '978-0-316-76948-0',
          genre: 'Coming of Age',
          description: 'A novel about teenage rebellion and angst.',
          publishedYear: 1951,
          totalCopies: 2,
          availableCopies: 2,
          addedBy: adminUser._id
        }
      ];

      await Book.insertMany(sampleBooks);
      console.log('📚 Sample books added to database');
    }
  } catch (error) {
    console.error('❌ Error seeding sample books:', error.message);
  }
};

// Function to initialize database with seed data
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Seed admin user first
    await seedAdminUser();
    
    // Then seed sample books
    await seedSampleBooks();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// Connection state helper
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    4: 'uninitialized'
  };
  
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDB,
  checkDBHealth,
  seedAdminUser,
  seedSampleBooks,
  initializeDatabase,
  getConnectionState
};