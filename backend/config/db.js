const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('MONGO_URI:', process.env.MONGO_URI); // Debugging line

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
