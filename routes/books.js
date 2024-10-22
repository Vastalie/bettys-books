const express = require('express');
const router = express.Router();
// Ensure you have db set globally like in your index.js
const db = global.db;  // Ensure db connection is globally accessible


// Route to render the book search page
router.get('/search', (req, res) => {
    res.render('search');
});

// Route to display previously searched books
router.get('/searched_books', (req, res) => {
    const searchedBooks = req.session.searchedBooks || [];  // Retrieve searched books from session or an empty array if none
    res.render('searchedBooks', { availableBooks: searchedBooks });
});


router.get('/search_result', (req, res) => {
    const searchText = req.query.search_text;
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    let queryValue = ['%' + searchText + '%'];

    // Query the database to find books that match the search query
    db.query(sqlquery, queryValue, (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching search results.');
        }

        // Insert the search term into the searched_books table
        let insertSearch = 'INSERT INTO searched_books (search_term) VALUES (?)';
        db.query(insertSearch, [searchText], (err, result) => {
            if (err) {
                console.error('Error inserting search term:', err);
            }
        });

        // Render the search results page
        res.render('searchResults', { availableBooks: result, searchText: searchText });
    });
});


// Route to render the add book page
router.get('/addbook', (req, res) => {
    res.render('addbook.ejs');  // Render the addbook form
});

// Route to handle the form submission when a book is added
router.post('/bookadded', (req, res) => {
    const { name, price } = req.body;  // Get the name and price from form

    // Insert the new book into the database
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const newRecord = [name, price];

    db.query(sqlquery, newRecord, (err, result) => {
        if (err) {
            return res.status(500).send('Error adding the book.');
        }
        res.send(`This book has been added to the database, name: ${name}, price: ${price}`);
    });
});

// Route to list all books
router.get('/list', (req, res) => {
    const sqlquery = "SELECT * FROM books";  // Query to fetch all books

    db.query(sqlquery, (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching books from the database.');
        }
        res.render('list.ejs', { availableBooks: result });  // Render the list.ejs template
    });
});

// Route to show books priced under 20
router.get('/bargainbooks', (req, res) => {
    const sqlquery = "SELECT * FROM books WHERE price < 20";  // Query for books under $20

    db.query(sqlquery, (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching bargain books from the database.');
        }
        res.render('bargains.ejs', { availableBooks: result });  // Render the bargains.ejs template
    });
});

module.exports = router;
