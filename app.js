const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());

const db = new sqlite3.Database('alarm_status.db');

db.run(`
  CREATE TABLE IF NOT EXISTS alarm_status (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER
  )
`);

const updateLedStatus = (status) => {
  db.run('INSERT INTO alarm_status (status) VALUES (?)', [status]);
};

const getLedStatus = (callback) => {
  console.log('!!getLedStatus!!');
  db.get('SELECT status FROM alarm_status ORDER BY timestamp DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error(err);
      callback(null);
    } else {
      callback(row ? row.status : null);
    }
  });
};

app.post('/update_status', express.json(), (req, res) => {
  try {
    const newStatus = req.body.status;

    updateLedStatus(newStatus);

    res.json({ message: 'Status updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
});

app.get('/get_status', (req, res) => {
  console.log('!!getStatus!!');
  try {
    getLedStatus((status) => {
      res.json({ status });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
