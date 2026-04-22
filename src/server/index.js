const express = require('express');
const cors = require('cors');
const path = require('path');
const SqliteStorage = require('../storage/sqliteStorage');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const storage = new SqliteStorage(path.join(__dirname, '../../data/jobs.db'));

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = storage.getAll();
    // Sort by score descending
    jobs.sort((a, b) => b.score - a.score);
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Dashboard running at http://localhost:${port}`);
});
