const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'auth_db'  // Explicitly set database name
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log(err));

// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });

// app.get('/about', (req, res) => {
//     res.send('About Us');
// });

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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
