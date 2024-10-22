// Import express and path modules
const express = require('express');
const path = require('path');
var session = require('express-session');
var validator = require('express-validator');
const expressSanitizer = require('express-sanitizer');

// Import mysql module
const mysql = require('mysql2');

// Create the express application object
const app = express();
const port = 8000;

// Create an input sanitizer
app.use(expressSanitizer());

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up public folder (for CSS and static files)
app.use(express.static(path.join(__dirname, 'public')));

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000 // Cookie expiration time
    }
}));

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

// Make the `db` connection globally available
global.db = db;

// Define our application-specific data
app.locals.shopData = { shopName: "Bettys Books" };

// Define a route for the homepage
app.get('/', (req, res) => {
    res.render('index');  // Ensure you have an `index.ejs` file in your `views` folder
});

// Route for login
app.get('/login', (req, res) => {
    res.render('login');
});

// POST route for handling login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;  // Get username and password from the form
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const user = results[0];
            if (password === user.password) {
                req.session.userId = user.id;
                return res.redirect('/list');
            } else {
                return res.status(401).send('Incorrect password');
            }
        } else {
            return res.status(404).send('User not found');
        }
    });
});

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load the route handlers for /books
const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);  // Add the books routes

// Example of using redirectLogin on a protected route
app.get('/list', function (req, res) {
    const sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching books from the database.');
        }
        res.render('list', { availableBooks: result });
    });
});

// POST /logout to handle user logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/list');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
