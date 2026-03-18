import mongoose from 'mongoose';
import 'dotenv/config';
import AdminAccount from './models/AdminAccount.js';

const checkAdminAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const accounts = await AdminAccount.find({});
        
        console.log(`Found ${accounts.length} AdminAccount records:`);
        accounts.forEach(a => {
            console.log(`- ID: ${a._id}, Email: ${a.email}, Name: ${a.name}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkAdminAccounts();
