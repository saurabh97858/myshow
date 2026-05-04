import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        mongoose.connection.on('connected', () => {
            isConnected = true;
            console.log('Database connected');
        });
        
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (error) {
        console.log('Database connection error:', error.message);
    }
}

export default connectDB;