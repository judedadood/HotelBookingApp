const express = require('express');
const mysql = require('mysql2');
const multer = require('multer')
const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'c237_hotelbookingapp',
    // port: 3307
    host: 'alwaysdata.com',
    user: '371142',
    password: 'P@ssword2905!',
    database: 'judedadood_c237hotelbooking',
    port: 3307
});


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
// Enable static files
app.use(express.static('public'));
// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Home page displaying room types
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM rooms';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving rooms');
        }
        res.render('index', {rooms: results});
    });
});

app.get('/addbooking/:type', (req, res) => {
    const roomType = req.params.type;
    const sql = 'SELECT * FROM rooms WHERE type = ?';
    connection.query(sql, [roomType], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving room details');
        }
        if (results.length === 0) {
            return res.status(404).send('Room type not found');
        }
        const room = results[0];
        res.render('addbooking', { room });
    });
});


// add booking form submission
app.post('/addbooking', (req, res) => {
    const { roomType, name, contact, guests, checkin, checkout } = req.body;
    const sql = 'INSERT INTO bookings (roomType, name, contact, guests, checkin, checkout) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [roomType, name, contact, guests, checkin, checkout], (err, results) => {
        if (err) {
            console.error('Error adding booking:', err);
            return res.status(500).send('Error adding booking');
        } else {
            res.redirect('/bookings');
        }
        
    });
});

// display bookings
app.get('/bookings', (req, res) => {
    const sql = 'SELECT * FROM bookings';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Error retrieving bookings');
        }
        res.render('bookings', { bookings: results });
    });
});

// read each booking
app.get('/booking/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT bookings.*, rooms.description
        FROM bookings
        JOIN rooms ON bookings.roomType = rooms.type
        WHERE bookings.id = ?
    `;
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Database Query Error:', error.message);
            return res.status(500).send('Error retrieving booking details');
        }
        if (results.length > 0) {
            res.render('booking', { bookings: results[0] });
        } else {
            res.status(404).send('Booking not found');
        }
    });
});

// show the edit booking form
app.get('/editbooking/:id', (req, res) => {
    const bookingId = req.params.id;
    const sql = 'SELECT * FROM bookings WHERE id = ?';
    
    connection.query(sql, [bookingId], (err, results) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).send('Error retrieving booking');
        }
        if (results.length > 0) {
            res.render('editbooking', {bookings: results[0] });
        } else {
            res.status(404).send('Booking not found')
        }
    });
});

// edit form submission
app.post('/editbooking/:id', (req, res) => {
    const bookingId = req.params.id;
    const { roomType, name, contact, guests, checkin, checkout } = req.body;
    const sql = 'UPDATE bookings SET roomType = ?, name = ?, contact = ?, guests = ?, checkin = ?, checkout = ? WHERE id = ?';

    connection.query(sql, [roomType, name, contact, guests, checkin, checkout, bookingId], (err, results) => {
        if (err) {
            console.error('Error updating booking:', err);
            res.status(500).send('Error updating booking');
        } else {
            res.redirect('/bookings'); 
        }
    });
});

app.get('/deletebooking/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM bookings WHERE id = ?';
    connection.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error deleting booking:', error);
            res.status(500).send('Error deleting booking');
        } else {
            res.redirect('/bookings');
        }
    });
});


app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/addfeedback', (req, res) => {
    const {name, contact, email, feedbacks} = req.body;
    const sql = 'INSERT INTO feedback (name, contact, email, feedbacks) VALUES (?,?,?,?)';
    connection.query(sql, [name, contact, email, feedbacks], (error, results) => {
        if (error) {
            console.error('Error adding feedback:', error);
            return res.status(500).send('Error adding feedback');
        } else {
            res.redirect('/sent')
        }
    })
})

app.get('/sent', (req, res) => {
    res.render('sent');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
