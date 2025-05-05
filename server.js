const express = require('express');
const app = express();
const cors = require('cors');
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
// Enable CORS for all origins (you can restrict it if needed)
app.use(cors());


// Route to upload news
app.post('/upload', upload.single('image'), (req, res) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'news' }, async (error, result) => {
      if (error) {
        console.error('Cloudinary Error:', error);
        return res.status(500).send('Upload failed');
      }
  
      const { image_title, image_description, news_type, news_side } = req.body;
      const image_url = result.secure_url;
  
      try {
        // Insert into news table
        await pool.query(
          'INSERT INTO news (image_url, image_title, image_description, news_type, news_side) VALUES ($1, $2, $3, $4, $5)',
          [image_url, image_title, image_description, news_type, news_side]
        );
        res.send('News saved successfully!');
      } catch (err) {
        console.error('DB Error:', err);
        res.status(500).send('Database error');
      }
    });
  
    stream.end(req.file.buffer);
  });



  
//    API: Get Latest 12 right-Side "World News"
app.get('/news/world/right', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM news 
         WHERE news_type = $1 AND news_side = $2 
         ORDER BY created_at DESC 
         LIMIT 12`,
        ['world_news', 'right']
      );
  
      const allNews = result.rows;
      const firstSix = allNews.slice(0, 4);
      const nextSix = allNews.slice(6, 8); // Skips the first 6
  
      res.json({
        part1: firstSix,
        part2: nextSix
      });
    } catch (err) {
      console.error('DB Error:', err);
      res.status(500).send('Database error');
    }
  });


//    API: Get Latest 12 Left-Side "World News"
app.get('/news/world/left', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM news 
         WHERE news_type = $1 AND news_side = $2 
         ORDER BY created_at DESC 
         LIMIT 12`,
        ['world_news', 'left']
      );
  
      const allNews = result.rows;
      const firstSix = allNews.slice(0, 6);
      const nextSix = allNews.slice(6, 12); // Skips the first 6
  
      res.json({
        part1: firstSix,
        part2: nextSix
      });
    } catch (err) {
      console.error('DB Error:', err);
      res.status(500).send('Database error');
    }
  });




// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
