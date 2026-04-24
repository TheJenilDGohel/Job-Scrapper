require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { getStorage } = require('../storage/index');
const { exec } = require('child_process');

let isScraping = false;
let lastScrapedAt = null;

const app = express();
const port = process.env.PORT || 3000;

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.directives,
      "script-src": ["'self'", "'unsafe-inline'"], // Allow dashboard scripts
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https:"]
    },
  },
}));

// Request logger for debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Tighten CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Common Vite port
  process.env.PRODUCTION_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.get('/ping', (req, res) => res.send('pong'));

const storage = getStorage();

app.use(express.static(path.join(__dirname, 'public')));

// Obfuscated endpoint to hide from casual observers
const INTERNAL_API_PATH = '/api/v1/internal/discovery/jobs_data_secure';

app.get(INTERNAL_API_PATH, async (req, res) => {
  // Check for internal session header to prevent unauthorized outside access
  const sessionToken = req.headers['x-internal-session'];
  const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
  
  if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied: Internal only' });
  }

  try {
    const jobs = await storage.getAllJobs();
    res.json({
      jobs,
      metadata: {
        lastScrapedAt,
        isScraping
      }
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/v1/internal/discovery/trigger_scrape', async (req, res) => {
  const sessionToken = req.headers['x-internal-session'];
  const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
  
  if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  if (isScraping) {
    return res.status(409).json({ error: 'Scrape already in progress' });
  }

  isScraping = true;
  const cliPath = path.join(__dirname, '../cli/index.js');
  
  console.log('Manual scrape triggered via API...');
  
  exec(`node "${cliPath}" run`, (error, stdout, stderr) => {
    isScraping = false;
    if (!error) {
      lastScrapedAt = new Date();
      console.log('Manual scrape completed successfully.');
    } else {
      console.error('Manual scrape failed:', error);
    }
  });

  res.json({ message: 'Scrape initiated' });
});

app.listen(port, () => {
  console.log(`🚀 Discovery Dashboard running at http://localhost:${port}`);
  console.log(`🔒 Security level: Production Hardened`);
});
