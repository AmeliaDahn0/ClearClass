const express = require('express');
const path = require('path');
const fs = require('fs');
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
    const dataPath = path.join(__dirname, 'public/data/student_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Transform object into array format and add progress bar
    const studentArray = Object.entries(data).map(([email, sessions]) => {
      const latestSession = Array.isArray(sessions) ? sessions[0] : sessions;
      
      // Calculate progress bar based on completed days
      const completedDays = new Set(latestSession.sessions.days.completed);
      const startedDays = new Set(latestSession.sessions.days.started);
      const allDays = [...new Set([...completedDays, ...startedDays])];
      const progress_bar = allDays.map(day => completedDays.has(day) ? 'completed' : 'incomplete');

      return {
        ...latestSession,
        email: email,
        progress_bar: progress_bar,
        timestamp: new Date().toISOString()
      };
    });

    res.json(studentArray);
  } catch (error) {
    console.error('Error reading Rocket Math data:', error);
    res.status(500).json({ error: 'Failed to fetch Rocket Math data' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 