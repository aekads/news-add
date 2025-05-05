const express = require('express');
const app = express();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Pool } = require('pg');
const path = require('path');

// Set up PostgreSQL
const pool = new Pool({
  user: 'u3m7grklvtlo6',
  host: '35.209.89.182',
  database: 'dbzvtfeophlfnr',
  password: 'AekAds@24',
  port: 5432,
});
// Cloudinary config
cloudinary.config({
  cloud_name: 'dqfnwh89v',
  api_key: '451893856554714',
  api_secret: 'zgbspSZH8AucreQM8aL1AKN9S-Y',

});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('image'), (req, res) => {
  const stream = cloudinary.uploader.upload_stream({ folder: 'news' }, async (error, result) => {
    if (error) {
      console.error('Cloudinary Error:', error);
      return res.status(500).send('Upload failed');
    }

    const { id, image_title, image_description, news_type, news_side } = req.body;
    const image_url = result.secure_url;

    try {
      await pool.query(
        'INSERT INTO news (id, image_url, image_title, image_description, news_type, news_side) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, image_url, image_title, image_description, news_type, news_side]
      );
      res.send('News saved successfully!');
    } catch (err) {
      console.error('DB Error:', err);
      res.status(500).send('Database error');
    }
  });

  stream.end(req.file.buffer);
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
