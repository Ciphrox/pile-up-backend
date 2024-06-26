const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const env = require('dotenv');
env.config();

const app = express();
app.use(bodyParser.json());

// Routes
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const transactionsRoute = require('./routes/transactionRoutes')


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    MONGO_URL = process.env.MONGO_URL;
    mongoose.connect(MONGO_URL);
    const connection = mongoose.connection;
    connection.on('error', (err) => {
        console.log(err);
    });
    connection.once('open', () => {
        console.log('MongoDB database connection established successfully');
    });

});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/transactions', transactionsRoute);