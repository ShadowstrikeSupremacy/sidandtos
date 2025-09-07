const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const router = express.Router();
const db = new sqlite3.Database(process.env.DB_PATH);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// JWT middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  db.run(
    `INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, file.filename, file.originalname, file.path, file.size, file.mimetype],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save file' });
      res.json({ message: 'File uploaded successfully', fileId: this.lastID });
    }
  );
});

// List files
router.get('/list', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM files WHERE user_id = ?`, [req.user.id], (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch files' });
    res.json({ files });
  });
});

// Download file
router.get('/download/:fileId', authenticateToken, (req, res) => {
  const fileId = req.params.fileId;

  db.get(`SELECT * FROM files WHERE id = ? AND user_id = ?`, [fileId, req.user.id], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'File not found' });
    res.download(file.file_path, file.original_name);
  });
});

// Delete file
router.delete('/delete/:fileId', authenticateToken, (req, res) => {
  const fileId = req.params.fileId;

  db.get(`SELECT * FROM files WHERE id = ? AND user_id = ?`, [fileId, req.user.id], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'File not found' });

    fs.unlink(file.file_path, unlinkErr => {
      if (unlinkErr) return res.status(500).json({ error: 'Failed to delete file' });

      db.run(`DELETE FROM files WHERE id = ?`, [fileId], function (dbErr) {
        if (dbErr) return res.status(500).json({ error: 'Failed to delete file record' });
        res.json({ message: 'File deleted successfully' });
      });
    });
  });
});

// File info
router.get('/info/:fileId', authenticateToken, (req, res) => {
  const fileId = req.params.fileId;

  db.get(`SELECT * FROM files WHERE id = ? AND user_id = ?`, [fileId, req.user.id], (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'File not found' });
    res.json({ file });
  });
});

module.exports = router;
