const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for development
app.use(cors());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Serve scraper data files
app.use('/scrapers', express.static(path.join(__dirname, 'src/scrapers')));

// API endpoint for Rocket Math data
app.get('/api/rocketmath/data', (req, res) => {
  try {
    // In production, this data should come from a database or environment variable
    // For now, we'll return an empty array
    res.json([]);
  } catch (error) {
    console.error('Error reading Rocket Math data:', error);
    res.status(500).json({ error: 'Failed to fetch Rocket Math data' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export the Express API
module.exports = app; 