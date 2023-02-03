const mongoose = require('mongoose');

async function connect() {
    try {

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

    } catch (err) {
        console.error('DB connection error:', err.code);
    }

    mongoose.connection.on('error', err => console.error('DB connection error:', err.code));
    mongoose.connection.on('disconnected', () => console.log('DB disconnected'));
    mongoose.connection.on('reconnected', () => console.log('DB reconnected'));

    const gracefulExit = () => {
        mongoose.connection.close(() => {
            console.log('DB connection terminated');
            process.exit(0);
        });
    }
    process.on('SIGINT', gracefulExit);
    process.on('SIGTERM', gracefulExit);
}

module.exports = { connect };