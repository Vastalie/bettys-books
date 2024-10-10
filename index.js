// Import express and path modules
const express = require('express');
const path = require('path');

// Import mysql module
const mysql = require('mysql2');

// Create the express application object
const app = express();
const port = 8000;

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up public folder (for CSS and static files)
app.use(express.static(path.join(__dirname, 'public')));

// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'bettys_books_app',
    password: 'qwertyuiop',
    database: 'bettys_books'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;  // Ensure the app stops if the connection fails
    }
    console.log('Connected to database');
});

// Make the `db` connection globally available (optional)
global.db = db;

// Define our application-specific data
app.locals.shopData = { shopName: "Bettys Books" };

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load the books routes
const booksRoutes = require('./routes/books');  // Assuming books routes are in /routes/books.js
app.use('/books', booksRoutes);

app.get('/', (req, res) => {
    res.render('index', { shopData: req.app.locals.shopData });
});

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
