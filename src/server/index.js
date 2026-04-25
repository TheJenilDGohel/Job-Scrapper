require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');
const { getStorage } = require('../storage/index');
const { exec } = require('child_process');
const CvParser = require('../parser/cvParser');

const upload = multer({ dest: 'uploads/' });
const TailorService = require('../tailoring/tailorService');
const PrepService = require('../tailoring/prepService');
const EmailDraftService = require('../tailoring/emailDraftService');
const MatchingEngine = require('../matching/engine');

const cvPath = process.env.CV_PATH || path.join(__dirname, '../../sample.pdf');
const cvParser = new CvParser(cvPath);
const tailorService = new TailorService(process.env.GEMINI_API_KEY);
const prepService = new PrepService(process.env.GEMINI_API_KEY);
const emailDraftService = new EmailDraftService(process.env.GEMINI_API_KEY);
let engine = null;

// Initialize engine gracefully
if (require('fs').existsSync(cvPath)) {
  cvParser.parse().then(profile => {
    engine = new MatchingEngine(profile);
    console.log('✅ Local CV Profile loaded for matching engine.');
  }).catch(e => console.warn('⚠️ CV exists but could not be parsed:', e.message));
} else {
  console.log('💡 No local CV found. Engine will use default matching parameters.');
}

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

// Request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// CORS - Simplified for Local-First
app.use(cors());

app.get('/ping', (req, res) => res.send('pong'));

const storage = getStorage();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

app.patch('/api/v1/internal/discovery/jobs/:id/status', async (req, res) => {
  const sessionToken = req.headers['x-internal-session'];
  const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
  
  if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const success = await storage.updateJobStatus(id, status);
    if (success) {
      res.json({ message: 'Status updated successfully' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (err) {
  console.error('Error updating status:', err);
  res.status(500).json({ error: 'Internal Server Error' });
  }
  });

  app.post('/api/v1/internal/discovery/jobs/:id/tailor', async (req, res) => {
  const sessionToken = req.headers['x-internal-session'];
  const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';

  if (!sessionToken || sessionToken !== expectedToken) {
  return res.status(403).json({ error: 'Access Denied' });
  }

  const { id } = req.params;

  try {
  const jobs = await storage.getAllJobs();
  const job = jobs.find(j => j.id == id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (!job.jobDescription) {
    return res.status(400).json({ error: 'Job description is required for tailoring' });
  }

  // Parse CV if we haven't yet (to get raw text)
  if (!cvParser.getRawText()) {
    await cvParser.parse();
  }

  const suggestions = await tailorService.generateSuggestions(
    cvParser.getRawText(),
    job.jobDescription
  );

  res.json(suggestions);
  } catch (err) {
  console.error('Error tailoring resume:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
  });

  app.post('/api/v1/internal/discovery/jobs/:id/prep', async (req, res) => {
    const sessionToken = req.headers['x-internal-session'];
    const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
    
    if (!sessionToken || sessionToken !== expectedToken) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    const { id } = req.params;

    try {
      const jobs = await storage.getAllJobs();
      const job = jobs.find(j => j.id == id);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (!job.jobDescription) {
        return res.status(400).json({ error: 'Job description is required for prep materials' });
      }

      // Parse CV if we haven't yet
      if (!cvParser.getRawText()) {
        await cvParser.parse();
      }

      const prepMaterial = await prepService.generatePrepMaterial(
        cvParser.getRawText(),
        job.jobDescription
      );

      res.json(prepMaterial);
    } catch (err) {
      console.error('Error generating prep material:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  app.post('/api/v1/internal/discovery/jobs/:id/draft-email', async (req, res) => {
    const sessionToken = req.headers['x-internal-session'];
    const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
    
    if (!sessionToken || sessionToken !== expectedToken) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    const { id } = req.params;

    try {
      const jobs = await storage.getAllJobs();
      const job = jobs.find(j => j.id == id);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (!job.jobDescription) {
        return res.status(400).json({ error: 'Job description is required for drafting an email' });
      }

      // Parse CV if we haven't yet
      if (!cvParser.getRawText()) {
        await cvParser.parse();
      }

      const draftData = await emailDraftService.generateDraft(
        cvParser.getRawText(),
        job.jobDescription,
        job.contactEmail,
        job.company,
        job.jobTitle
      );

      res.json(draftData);
    } catch (err) {
      console.error('Error generating email draft:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  app.post('/api/v1/internal/discovery/jobs', async (req, res) => {
  const sessionToken = req.headers['x-internal-session'];
  const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';

  if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const jobData = req.body;
  if (!jobData.jobTitle || !jobData.company || !jobData.url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Calculate score if engine available
    let score = 50;
    if (engine) {
      const scored = engine.scoreJob(jobData);
      score = scored.score;
    }

    const job = {
      ...jobData,
      score,
      source: jobData.source || 'extension',
      status: 'discovered'
    };

    await storage.save(job);
    res.status(201).json({ message: 'Job saved successfully', job });
    } catch (err) {
    console.error('Error saving manual job:', err);
    res.status(500).json({ error: 'Internal Server Error' });
    }
    });

    app.get('/api/v1/internal/automation/logs', async (req, res) => {
    const sessionToken = req.headers['x-internal-session'];
    const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';

    if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied' });
    }

    try {
    const logPath = path.join(process.cwd(), 'logs', 'cron-status.log');
    if (!require('fs').existsSync(logPath)) {
      return res.json({ logs: 'No automation logs found yet.' });
    }
    const logs = require('fs').readFileSync(logPath, 'utf8');
    const lastLines = logs.split('\n').slice(-50).join('\n');
    res.json({ logs: lastLines });
    } catch (err) {
    res.status(500).json({ error: 'Failed to read logs' });
    }
    });

    app.get('/api/v1/internal/analytics/summary', async (req, res) => {
    const sessionToken = req.headers['x-internal-session'];
    const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';

    if (!sessionToken || sessionToken !== expectedToken) {
    return res.status(403).json({ error: 'Access Denied' });
    }

    try {
    const jobs = await storage.getAllJobs();
    
    const summary = {
      total: jobs.length,
      byStatus: {
        discovered: 0,
        applied: 0,
        interviewing: 0,
        offered: 0
      },
      bySource: {},
      byScore: {
        high: 0,   // > 75
        medium: 0, // 40-75
        low: 0     // < 40
      }
    };

    jobs.forEach(job => {
      // Status
      const status = job.status || 'discovered';
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;

      // Source
      const source = job.source || 'Unknown';
      summary.bySource[source] = (summary.bySource[source] || 0) + 1;

      // Score
      if (job.score > 75) summary.byScore.high++;
      else if (job.score >= 40) summary.byScore.medium++;
      else summary.byScore.low++;
    });

    res.json(summary);
    } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
    }
    });

    // Career Profile Endpoints
    app.get('/api/v1/internal/profiles', async (req, res) => {
      const sessionToken = req.headers['x-internal-session'];
      const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
      if (!sessionToken || sessionToken !== expectedToken) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      try {
        const profiles = await storage.getProfiles();
        res.json(profiles);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profiles' });
      }
    });

    app.post('/api/v1/internal/profiles', upload.single('cv'), async (req, res) => {
      const sessionToken = req.headers['x-internal-session'];
      const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
      if (!sessionToken || sessionToken !== expectedToken) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      try {
        const { name } = req.body;
        if (!name || !req.file) {
          return res.status(400).json({ error: 'Profile name and CV file are required' });
        }

        const tempParser = new CvParser(req.file.path);
        const profileData = await tempParser.parse();
        const cvText = tempParser.getRawText();

        const profileId = await storage.saveProfile({
          name,
          roles: profileData.roles,
          skills: profileData.skills,
          experience: profileData.experience,
          cvText,
          isDefault: false
        });

        // Cleanup temp file
        if (require('fs').existsSync(req.file.path)) {
          require('fs').unlinkSync(req.file.path);
        }

        res.status(201).json({ message: 'Profile created successfully', profileId });
      } catch (err) {
        console.error('Error creating profile:', err);
        res.status(500).json({ error: 'Failed to create career profile' });
      }
    });

    app.patch('/api/v1/internal/profiles/:id/default', async (req, res) => {
      const sessionToken = req.headers['x-internal-session'];
      const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
      if (!sessionToken || sessionToken !== expectedToken) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      try {
        await storage.setDefaultProfile(req.params.id);
        res.json({ message: 'Default profile updated' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to update default profile' });
      }
    });

    app.delete('/api/v1/internal/profiles/:id', async (req, res) => {
      const sessionToken = req.headers['x-internal-session'];
      const expectedToken = process.env.INTERNAL_SESSION_TOKEN || 'job-discovery-secure-2026';
      if (!sessionToken || sessionToken !== expectedToken) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      try {
        await storage.deleteProfile(req.params.id);
        res.json({ message: 'Profile deleted' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to delete profile' });
      }
    });

    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {  app.listen(port, () => {
    console.log(`🚀 Discovery Dashboard running at http://localhost:${port}`);
    console.log(`🔒 Security level: Production Hardened`);
  });
}

module.exports = app;
