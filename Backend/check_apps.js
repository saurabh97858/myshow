import mongoose from 'mongoose';
import 'dotenv/config';
import AdminApplication from './models/AdminApplication.js';

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const applications = await AdminApplication.find();
        console.log(`Total Applications: ${applications.length}`);
        applications.forEach(app => {
            console.log(`- ID: ${app._id}, Name: ${app.name}, Email: ${app.email}, Status: ${app.status}, Created: ${app.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
