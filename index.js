const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Fail fast instead of hanging 10s when DB is not connected (clearer errors in logs/API).
mongoose.set('bufferCommands', false);

/** Browser clients on another origin (e.g. Vercel) need CORS. Set CORS_ORIGIN in Render to your frontend URL, or leave unset for `*`. */
function corsMiddleware(req, res, next) {
    const allow = process.env.CORS_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    if (allow !== '*') {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
}
app.use(corsMiddleware);
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const cartRoutes = require('./routes/cartRoutes');
const searchRoutes = require('./routes/searchRoutes');

const path = require('path');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



dotenv.config();

// Include text/plain so Postman "Raw → Text" still parses JSON bodies (otherwise Content-Type is text/plain and req.body stays empty).
app.use(
    express.json({
        type: ['application/json', 'application/*+json', 'text/plain'],
    })
);
app.use(express.urlencoded({ extended: true }));
app.use('/api', productRoutes);
app.use('/api', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/email', emailRoutes);
app.use('/cart', cartRoutes);

app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const labels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(state === 1 ? 200 : 503).json({
        ok: state === 1,
        mongo: labels[state] ?? String(state),
    });
});

const PORT = process.env.PORT || 5000;

async function start() {
    if (!process.env.MONGODB_URI) {
        console.error('FATAL: MONGODB_URI is not set (add it in Render → Environment).');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME || 'auth_db',
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            // Atlas + Render: prefer IPv4 when IPv6 path is broken (avoids "buffering timed out").
            family: 4,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        console.error(
            'Check: (1) MONGODB_URI in Render env, (2) Atlas → Network Access → allow 0.0.0.0/0, (3) URL-encode password in URI, (4) Render Start Command = npm start (uses index.js).'
        );
        process.exit(1);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start();
