const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* ------------------ ROUTES ------------------ */

/* GET all patients */
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/* GET patient by id */
app.get('/api/patients/:id', (req, res) => {
  db.get(
    'SELECT * FROM patients WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(row);
    }
  );
});

/* CREATE patient */
app.post('/api/patients', (req, res) => {
  const { first_name, last_name, date_of_birth, gender, status } = req.body;

  db.run(
    `INSERT INTO patients 
     (first_name, last_name, date_of_birth, gender, status)
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, date_of_birth, gender, status],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        first_name,
        last_name,
        date_of_birth,
        gender,
        status
      });
    }
  );
});

/* UPDATE patient */
app.put('/api/patients/:id', (req, res) => {
  const { first_name, last_name, date_of_birth, gender, status } = req.body;
  const id = req.params.id;

  db.run(
    `UPDATE patients
     SET first_name = ?,
         last_name = ?,
         date_of_birth = ?,
         gender = ?,
         status = ?
     WHERE id = ?`,
    [first_name, last_name, date_of_birth, gender, status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json({ success: true });
    }
  );
});

/* DELETE patient */
app.delete('/api/patients/:id', (req, res) => {
  db.run(
    'DELETE FROM patients WHERE id = ?',
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json({ success: true });
    }
  );
});

/* ------------------ SERVER ------------------ */

/* IMPORTANT: Railway provides PORT */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ SQLite API running on port ${PORT}`);
});
