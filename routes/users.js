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

// Export the router object so index.js can access it
module.exports = router;
