const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');  // For password hashing
const saltRounds = 10;  // Define the number of salt rounds for bcrypt

// Task 4: Add redirectLogin middleware after the require statements
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./login'); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

// Register form route
router.get('/register', (req, res) => {
    res.render('register', { shopData: req.app.locals.shopData });
});

// Add user form route
router.get('/adduser', (req, res) => {
    res.render('adduser', { shopData: req.app.locals.shopData });
});

// Handle registration
router.post(['/adduser', '/register'], async function (req, res) {
    const { username, first_name, last_name, email, password } = req.body;
    const trimmedUsername = username.trim();

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO Users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
        global.db.query(sql, [trimmedUsername, first_name, last_name, email, hashedPassword], (err) => {
            if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).send('Error inserting user data');
            }

            // Redirect to success page after registration
            res.redirect('/users/adduser-success');  
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error');
    }
});

// Success page route for adduser and register
router.get('/adduser-success', (req, res) => {
    res.render('adduser-success', { shopData: req.app.locals.shopData });
});

// List all users route
router.get('/list', (req, res) => {
    const sql = `SELECT username, first_name, last_name, email FROM Users`;

    global.db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        res.render('userlist', { users: result, shopData: req.app.locals.shopData });
    });
});

// Login form route
router.get('/login', (req, res) => {
    res.render('login', { shopData: req.app.locals.shopData });
});

// Handle login POST request
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    try {
        const sql = `SELECT * FROM Users WHERE username = ?`;
        global.db.query(sql, [trimmedUsername], async (err, results) => {
            if (err) {
                console.error('Error finding user:', err);
                return res.render('loggedin', { message: 'An error occurred. Please try again.' });
            }

            if (results.length === 0) {
                return res.render('loggedin', { message: 'Invalid username or password' });
            }

            const user = results[0];

            const match = await bcrypt.compare(trimmedPassword, user.hashedPassword);

            if (match) {
                // Successful login - Save user session here
                req.session.userId = user.id;  // Save the userId in the session
                console.log("Session saved with userId: ", req.session.userId);

                return res.render('loggedin', { message: `Login successful! Welcome, ${user.username}.` });
            } else {
                // Failed login
                return res.render('loggedin', { message: 'Invalid username or password' });
            }
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.render('loggedin', { message: 'Internal server error. Please try again later.' });
    }
});

// Profile page route - accessible only if logged in
router.get('/profile', redirectLogin, function (req, res) {
    // Replace this with actual user data from your database, if necessary
    res.render('profile', { user: req.session.userId });
});

// Export the router
module.exports = router;
