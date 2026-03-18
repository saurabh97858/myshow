import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/userModel.js';

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const userId = "user_33euwxxCF5hxiN5vEchqJ7vGuH2"; // From logs
        const user = await User.findById(userId);
        
        if (user) {
            console.log("User Found:", JSON.stringify(user, null, 2));
        } else {
            console.log("User NOT found in DB with ID:", userId);
            // Search by email
            const adminEmail = "saurabhgupta97858@gmail.com";
            const userByEmail = await User.findOne({ email: adminEmail });
            if (userByEmail) {
                console.log("Found user by email instead:", JSON.stringify(userByEmail, null, 2));
            } else {
                console.log("No user found by email either.");
            }
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUser();
