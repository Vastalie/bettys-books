const { check, validationResult } = require('express-validator');
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');  // For password hashing
const saltRounds = 10;  // Define the number of salt rounds for bcrypt

// Task 4: Add redirectLogin middleware after the require statements
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
};

// Register form route
router.get('/register', (req, res) => {
    res.render('register', { errors: [], shopData: req.app.locals.shopData });
});

// Add user form route
router.get('/adduser', (req, res) => {
    res.render('adduser', { shopData: req.app.locals.shopData });
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

// Add the missing GET route for login page
router.get('/login', (req, res) => {
    res.render('login', { errors: [], shopData: req.app.locals.shopData }); // Pass errors as an empty array initially
});


// Handle login POST request with validation
router.post('/login', [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, return to login page with error messages
        return res.render('login', {
            errors: errors.array(),
            shopData: req.app.locals.shopData
        });
    }

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
            const hashedPassword = user.password || user.hashedPassword; // Adjust to your DB field name

            if (!hashedPassword) {
                console.error("Error: No hashed password found in the database for this user.");
                return res.status(500).send('Server error: No password stored for this user.');
            }

            const match = await bcrypt.compare(trimmedPassword, hashedPassword);

            if (match) {
                // Successful login - Save user session here
                req.session.userId = user.id;  // Save the userId in the session
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

// Handle registration with validation and checking for duplicates
router.post('/register', [
    check('first_name').notEmpty().withMessage('First name is required'),
    check('last_name').notEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('username').notEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation fails, re-render the page with error messages
        return res.render('register', {
            errors: errors.array(),
            shopData: req.app.locals.shopData
        });
    }

    // Trim inputs to remove any extra spaces
    const { username, first_name, last_name, email, password } = req.body;
    const trimmedUsername = username.trim();
    const trimmedFirstName = first_name.trim();
    const trimmedLastName = last_name.trim();
    const trimmedEmail = email.trim();

    // Check if any required fields are empty after trimming
    if (!trimmedUsername || !trimmedFirstName || !trimmedLastName || !trimmedEmail) {
        return res.status(400).send('All fields are required.');
    }

    // Check if the username or email already exists
    const checkSql = 'SELECT * FROM Users WHERE username = ? OR email = ?';
    global.db.query(checkSql, [trimmedUsername, trimmedEmail], async (err, results) => {
        if (err) {
            console.error('Error checking for duplicates:', err);
            return res.status(500).send('Error checking for duplicates');
        }

        if (results.length > 0) {
            // If the user already exists
            return res.render('register', {
                errors: [{ msg: 'Username or email already exists.' }],
                shopData: req.app.locals.shopData
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

            // Insert the new user into the database
            const sql = `INSERT INTO Users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
            global.db.query(sql, [trimmedUsername, trimmedFirstName, trimmedLastName, trimmedEmail, hashedPassword], (err) => {
                if (err) {
                    console.error('Error inserting user data:', err);
                    return res.status(500).send('Error inserting user data');
                }

                // Redirect to success page after successful registration
                res.redirect('/users/adduser-success');
            });
        } catch (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Internal server error');
        }
    });
});

// Export the router
module.exports = router;
