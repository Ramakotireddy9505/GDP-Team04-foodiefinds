const mongoose = require('mongoose');
const dotenv=require('dotenv').config()
const db_url = process.env.db_url

const connectMongoDb = async () => {
    try {
        const { connection } = await mongoose.connect(db_url);
        console.log(`Database connected : ${connection.name}`);
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

module.exports = connectMongoDb;
