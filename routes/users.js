const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');  // For password hashing
const saltRounds = 10;  // Define the number of salt rounds for bcrypt

// No need to require the db object, it is globally available via global.db

// Add user form route
router.get('/adduser', (req, res) => {
    console.log("Add User route hit");
    res.render('adduser', { shopData: req.app.locals.shopData });
});

// Register form route
router.get('/register', (req, res) => {
    console.log("Register route hit");
    res.render('register', { shopData: req.app.locals.shopData });
});

// Add user POST route - Handles form submission and user addition
router.post(['/adduser', '/register'], async function (req, res, next) {
    const { username, first_name, last_name, email, password } = req.body;

    try {
        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the database
        const sql = `INSERT INTO Users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
        
        global.db.query(sql, [username, first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).send('Error inserting user data');
            }

            // Redirect to a success page after successful registration or user creation
            res.redirect('/users/adduser-success');  // Ensure adduser-success.ejs exists
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

// Add route to list all users
router.get('/list', (req, res) => {
    const sql = `SELECT username, first_name, last_name, email FROM Users`; // Do not select the password

    global.db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching users');
        }

        // Render the user list page and pass the result to the view
        res.render('userlist', { users: result, shopData: req.app.locals.shopData });
    });
});

// Export the router
module.exports = router;
