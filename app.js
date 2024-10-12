const fastify = require('fastify');
const mongoose = require('mongoose');
const env = require('dotenv');

// Load environment variables
env.config();

// Create Fastify instance
const app = fastify();

// Load routes
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const transactionsRoute = require('./routes/transactionRoutes');

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    throw new Error("MongoDB URL is not defined in the environment variables.");
}

// Connect to MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Register Routes
app.register(authRoute, { prefix: '/auth' });
app.register(userRoute, { prefix: '/user' });
app.register(transactionsRoute, { prefix: '/transactions' });

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // Change this to listen on all available network interfaces

// Use object to specify listen options (host and port)
app.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
        console.error('Error starting the server:', err);
        process.exit(1);
    }
    console.log(`Server is running on ${address}`);
});
