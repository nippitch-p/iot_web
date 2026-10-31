const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, getDbType } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const path = require('path');
const fs = require('fs');

// Routes
app.use('/api/v1/students', studentRoutes);
app.use('/api/students', studentRoutes); // Backward compatibility

// Health check / Info API
app.get(['/api', '/api/v1'], (req, res) => {
  res.json({
    name: 'Student Management CRUD API',
    version: 'v1',
    techStack: 'React + Express + PostgreSQL',
    databaseEngine: getDbType(),
    status: 'online',
    endpoints: {
      create: 'POST /api/v1/students',
      readAll: 'GET /api/v1/students',
      readOne: 'GET /api/v1/students/:student_id',
      update: 'PUT /api/v1/students/:student_id',
      delete: 'DELETE /api/v1/students/:student_id',
      stats: 'GET /api/v1/students/stats/summary',
    },
  });
});

// Serve frontend build if exists
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(` running on http://localhost:${PORT}`);
      console.log(` http://localhost:${PORT}/api/v1/students`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
