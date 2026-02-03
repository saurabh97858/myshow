import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config();

// Script to make a user admin by email
const makeAdmin = async (email) => {
    try {
        console.log(`\n🔍 Searching for user with email: ${email}...`);

        // Get all users and find by email
        const users = await clerkClient.users.getUserList({
            emailAddress: [email],
        });

        if (!users.data || users.data.length === 0) {
            console.log("❌ User not found with this email.");
            console.log("\n💡 Tip: Make sure the user has signed up first!");
            return;
        }

        const user = users.data[0];
        console.log(`✅ User found: ${user.firstName || ""} ${user.lastName || ""}`);
        console.log(`   User ID: ${user.id}`);

        // Check if already admin
        if (user.privateMetadata?.role === "admin") {
            console.log("\n⚠️  User is already an admin!");
            return;
        }

        // Update user to admin
        console.log("\n🔧 Setting user as admin...");
        await clerkClient.users.updateUser(user.id, {
            privateMetadata: {
                ...user.privateMetadata,
                role: "admin",
            },
        });

        console.log("✅ SUCCESS! User is now an admin! 🎉");
        console.log("\n📋 Next steps:");
        console.log("   1. Refresh the app in browser");
        console.log("   2. Login with this email");
        console.log("   3. You'll see 'Admin Panel' in navbar");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.log("\n❌ Please provide an email address!");
    console.log("\n📝 Usage:");
    console.log("   node makeAdmin.js your-email@gmail.com");
    process.exit(1);
}

// Run the script
makeAdmin(email).then(() => {
    console.log("\n✨ Script completed!\n");
    process.exit(0);
});
