const express = require('express');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const mysql = require('mysql2');
const dbConnection = mysql.createConnection({
  host: 'localhost', // Change to your MySQL server host
  user: 'bharath', // Change to your MySQL username
  password: 'root', // Change to your MySQL password
  database: 'to_do', // Change to your MySQL database name
});

dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

dbConnection.query(
  'CREATE TABLE IF NOT EXISTS todos (id INT AUTO_INCREMENT PRIMARY KEY, task TEXT)',
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

app.get('/', (req, res) => {
  dbConnection.query('SELECT * FROM todos', (err, results) => {
    if (err) {
      console.error(err.message);
    } else {
      res.render('index', { todos: results });
    }
  });
});

app.post('/add', async (req, res) => {
  const { task } = req.body;
  try {
    const [results] = await db.query('INSERT INTO todos (task) VALUES (?)', [task]);
    console.log('Inserted a new task with ID:', results.insertId);
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error adding a new task');
  }
});


app.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await db.query('DELETE FROM todos WHERE id = ?', [id]);
    console.log('Deleted task with ID:', id);
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error deleting the task');
  }
});

app.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  const editedTask = req.body.editedTask;
  db.query('UPDATE todos SET task = ? WHERE id = ?', [editedTask, id], (err, results) => {
    if (err) {
      console.error(err.message);
    } else {
      res.redirect('/');
    }
  });
});


// Configure Multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });  
// Serve the upload.html file from the '/upload' route
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/upload.html'));
  });
  
// Define a route for handling file uploads
  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      const { filename, path } = req.file;
  
      //Insert image information into the database
      const [results] = await db.query('INSERT INTO images (filename, filepath) VALUES (?, ?)', [filename, path]);
  
      res.status(200).json({ message: 'File uploaded successfully!', fileId: results.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while uploading the file.' });
    }
  });
  
  //relationship between the todos and image table from here
  app.get('/relationship', (req, res) => {
    const sql = `
      SELECT todos.id, todos.task, images.filename, images.filepath
      FROM todos
      LEFT JOIN images ON todos.image_id = images.id;
    `;
  
    dbConnection.query(sql, (err, results) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error fetching data');
      } else {
        res.render('relationship', { todosWithImages: results }); // Render the 'relationship' template
      }
    });
  });
  
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
