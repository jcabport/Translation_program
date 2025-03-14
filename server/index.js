const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from the React app on different ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/novel-translation');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10s
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10
    };

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/novel-translation', options);
    console.log(`MongoDB Connected Successfully:`);
    console.log(`- Host: ${conn.connection.host}`);
    console.log(`- Port: ${conn.connection.port}`);
    console.log(`- Database: ${conn.connection.name}`);
    console.log(`- Connection State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error('MongoDB Connection Error Details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    console.error('Please make sure MongoDB is running and accessible');
    process.exit(1);
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import routes
const novelRoutes = require('./routes/novelRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const nameRoutes = require('./routes/nameRoutes');
const translationRoutes = require('./routes/translationRoutes');

// Use routes
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/names', nameRoutes);
app.use('/api', translationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
