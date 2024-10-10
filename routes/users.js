const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');  // For password hashing

const saltRounds = 10;  // Define the number of salt rounds for bcrypt

// Add user form route
router.get('/adduser', (req, res) => {
    console.log("Add User route hit");  // Confirm the route is hit
    res.render('adduser', { shopData: req.app.locals.shopData });  // Render the form
});

// Add user POST route - Handles form submission and user addition
router.post('/adduser', async function (req, res, next) {
    const { username, first_name, last_name, email, password } = req.body;

    try {
        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the database (example SQL query)
        const sql = `INSERT INTO Users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [username, first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).send('Error inserting user data');
            }

            // Build the result response string (Only declare 'result' once)
            let response = 'Hello ' + first_name + ' ' + last_name + ' you are now registered! We will send an email to you at ' + email + '.';
            response += ' Your password is: ' + password + ' and your hashed password is: ' + hashedPassword;
            
            // Send the response with plain and hashed passwords
            res.send(response);
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error');
    }
});

// Success page route
router.get('/adduser-success', (req, res) => {
    res.render('adduser-success', { shopData: req.app.locals.shopData });
});

// Export the router so index.js or app.js can use it
module.exports = router;
