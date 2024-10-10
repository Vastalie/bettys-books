const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');  // Add bcrypt here

const saltRounds = 10;  // Define the number of salt rounds for bcrypt

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post('/registered', function (req, res, next) {
    const plainPassword = req.body.password;  // Get the password
    const username = req.body.username;       // Get the username
    
    // Hash the password before saving to the database
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
            return next(err);  // Handle errors
        }
        // Save the user data and the hashed password to the database
        // Replace this comment with your database saving logic

        // Example: Using the hashedPassword for storage in the database

        res.send('Hello ' + req.body.first + ' ' + req.body.last + 
                 ', you are now registered! We will send an email to you at ' + req.body.email);
    });
});

// Adduser route - GET: Show the user registration form
router.get('/adduser', function (req, res, next) {
    res.render('adduser.ejs');
});

// Adduser route - POST: Handle user form submission and add user to the database
router.post('/adduser', async function (req, res, next ) {
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the user data into the database
        // Replace this comment with your database query logic to save the user

        res.redirect('/users/adduser-success');  // Redirect to success page after adding user
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error');
    }
});

// Adduser success route - GET: Display success message
router.get('/adduser-success', (req, res) => {
    res.render('adduser-success', { shopData: req.app.locals.shopData });
});

// Export the router object so index.js can access it
module.exports = router;
