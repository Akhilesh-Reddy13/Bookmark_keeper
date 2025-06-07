import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bookroute from './routes/bookmarkRoutes.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Configure CORS to allow frontend to communicate with backend
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'username', 'password']
}));

// API routes - these must come before static file serving
app.use('/api/bookmarks', bookroute);

// Basic API test route
app.get('/api', (req, res) => {
  res.json({ message: 'Bookmark API is running' });
});

// Serve static files from frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Handle root route specifically
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Handle any other non-API routes (SPA fallback)
app.get(/^\/[^api].*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Environment check
console.log("Environment variables status:");
console.log("- PORT:", process.env.PORT || "Not set, using default 5000");
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
console.log("- JWT_KEY:", process.env.JWT_KEY ? "Set" : "Not set");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Frontend served from: ${path.join(__dirname, '../frontend/public')}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

