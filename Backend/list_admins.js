import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/userModel.js';

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
        
        console.log(`Found ${admins.length} admin/superadmin users:`);
        admins.forEach(u => {
            console.log(`- ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkAdmins();
