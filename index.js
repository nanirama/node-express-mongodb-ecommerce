const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

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

app.get('/', (req, res) => {
    res.type('text').send('ok');
});

app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const labels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(state === 1 ? 200 : 503).json({
        ok: state === 1,
        mongo: labels[state] ?? String(state),
    });
});

const PORT = process.env.PORT || 5000;

function mongoUri() {
    return process.env.MONGODB_URI || process.env.MONGO_URI || '';
}

async function connectMongo() {
    const uri = mongoUri();
    if (!uri) {
        console.error(
            'MONGODB_URI is not set. On Render: Dashboard → Environment → add MONGODB_URI (do not rely on .env in git).'
        );
        return false;
    }
    try {
        await mongoose.connect(uri, {
            dbName: process.env.MONGODB_DB_NAME || 'auth_db',
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log('MongoDB connected');
        return true;
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        console.error(
            'Fix: Render → Environment → MONGODB_URI. Atlas → Network Access → 0.0.0.0/0. URL-encode special chars in password.'
        );
        return false;
    }
}

async function start() {
    // Bind HTTP first so Render sees the port open; do not process.exit() on DB failure.
    await new Promise((resolve) => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(
                'Env check: MONGODB_URI=',
                mongoUri() ? '(set)' : '(MISSING — add in Render Environment)'
            );
            resolve();
        });
    });

    const ok = await connectMongo();
    if (!ok) {
        console.error(
            'App is up without MongoDB. /health will show mongo state; fix URI and redeploy or restart.'
        );
    }
}

start().catch((err) => {
    console.error('Startup error:', err);
    process.exit(1);
});
