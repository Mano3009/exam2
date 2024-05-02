const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./db/todo.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  }
  console.log('Connected to the todo database.');
});

// Create todo table
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)');
});

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.get('/', (req, res) => {
  db.all('SELECT * FROM todos', (err, rows) => {
    if (err) {
      console.error('Database query error:', err.message);
      res.status(500).send('Internal Server Error');
    }
    res.render('index', { todos: rows });
  });
});

app.post('/add', (req, res) => {
  const task = req.body.task;
  db.run('INSERT INTO todos (task) VALUES (?)', [task], (err) => {
    if (err) {
      console.error('Database insert error:', err.message);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

app.get('/edit/:id', (req, res) => {
  const taskId = req.params.id;
  // Fetch the task details from the database
  db.get('SELECT * FROM todos WHERE id = ?', [taskId], (err, row) => {
    if (err) {
      console.error('Database query error:', err.message);
      res.status(500).send('Internal Server Error');
    }
    // Render the edit form with the task details
    res.render('edit', { task: row });
  });
});

app.post('/edit/:id', (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body.task;
  // Update the task in the database
  db.run('UPDATE todos SET task = ? WHERE id = ?', [updatedTask, taskId], (err) => {
    if (err) {
      console.error('Database update error:', err.message);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

app.post('/delete/:id', (req, res) => {
  const taskId = req.params.id;
  // Delete the task from the database
  db.run('DELETE FROM todos WHERE id = ?', [taskId], (err) => {
    if (err) {
      console.error('Database delete error:', err.message);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
