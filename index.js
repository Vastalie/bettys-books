// Import express and path modules
const express = require('express');
const path = require('path');
var session = require('express-session');
var validator = require ('express-validator');

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

// Create a session (Task 3)
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

// Make the `db` connection globally available (optional)
global.db = db;

// Define our application-specific data
app.locals.shopData = { shopName: "Bettys Books" };

// Define redirectLogin middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login page if user not logged in
    }
    next(); // Proceed if logged in
};

module.exports.redirectLogin = redirectLogin;


// Route for login (you need a login page to test redirectLogin)
app.get('/login', (req, res) => {
    res.render('login');  // Render a login page (you need to create login.ejs)
});

// POST route for handling login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;  // Get username and password from the form
    
    // Query to check if the user exists in the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const user = results[0];

            // In a real application, use bcrypt to compare hashed passwords
            if (password === user.password) {  // Replace with bcrypt.compare() in a real-world scenario
                // Set the session userId if login is successful
                req.session.userId = user.id;
                return res.redirect('/list');  // Redirect to a protected page after successful login
            } else {
                return res.status(401).send('Incorrect password');  // Password is incorrect
            }
        } else {
            return res.status(404).send('User not found');  // User does not exist
        }
    });
});

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load the books routes
const booksRoutes = require('./routes/books');  // Assuming books routes are in /routes/books.js
app.use('/books', booksRoutes);

// Example of using redirectLogin on a protected route
app.get('/list', redirectLogin, function (req, res) {
    // Example book data (in practice, this could come from your database)
    const bookData = [
        { title: 'Book 1', author: 'Author 1' },
        { title: 'Book 2', author: 'Author 2' }
    ];
    res.render('list', { books: bookData });
});

app.get('/books/search', redirectLogin, function (req, res) {
    console.log(req.session); // Check if session is available
    res.render('searchResults');
});


// POST /logout to handle user logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/list');  // If there's an error, stay on the list page
        }
        res.clearCookie('connect.sid');  // Clear the session cookie
        res.redirect('/login');  // Redirect to the login page after logging out
    });
});

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));