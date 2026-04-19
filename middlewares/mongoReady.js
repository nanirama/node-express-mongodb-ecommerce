const mongoose = require('mongoose');

const DEFAULT_MS = 25000;

/**
 * Waits for mongoose.connect() to finish when the server bound HTTP before Mongo was ready.
 */
module.exports = async function mongoReady(req, res, next) {
    try {
        if (mongoose.connection.readyState === 1) {
            return next();
        }
        const ms = Number(process.env.MONGO_READY_TIMEOUT_MS) || DEFAULT_MS;
        await Promise.race([
            mongoose.connection.asPromise(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('MongoDB connection timeout')), ms)
            ),
        ]);
        if (mongoose.connection.readyState === 1) {
            return next();
        }
        return res.status(503).json({
            error: 'Database not connected',
            message: 'MongoDB did not reach a connected state.',
        });
    } catch (err) {
        return res.status(503).json({
            error: 'Database not connected',
            message: err.message,
        });
    }
};
