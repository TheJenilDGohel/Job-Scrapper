const express = require('express');
const cors = require('cors');
const path = require('path');
const { getStorage } = require('../storage/index');

const app = express();
const port = process.env.PORT || 3000;

// Request logger for debugging - MUST BE FIRST
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.get('/ping', (req, res) => res.send('pong'));

const storage = getStorage();

app.use(express.static(path.join(__dirname, 'public')));

// Obfuscated endpoint to hide from casual observers
const INTERNAL_API_PATH = '/api/v1/internal/discovery/jobs_data_secure';

app.get(INTERNAL_API_PATH, async (req, res) => {
  // Check for internal session header to prevent unauthorized outside access
  const sessionToken = req.headers['x-internal-session'];
  if (!sessionToken || sessionToken !== 'job-discovery-secure-2026') {
    return res.status(403).json({ error: 'Access Denied: Internal only' });
  }

  try {
    const jobs = await storage.getAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Dashboard running at http://localhost:${port}`);
});
