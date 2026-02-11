import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config();

// Script to check a user's admin status by email
const checkUser = async (email) => {
    try {
        console.log(`\n🔍 Checking status for email: ${email}...`);

        // Get all users and find by email
        const users = await clerkClient.users.getUserList({
            emailAddress: [email],
        });

        if (!users.data || users.data.length === 0) {
            console.log("❌ User not found with this email.");
            return;
        }

        const user = users.data[0];
        console.log(`✅ User found: ${user.firstName || ""} ${user.lastName || ""}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Email Addresses: ${user.emailAddresses.map(e => e.emailAddress).join(", ")}`);
        console.log(`   Private Metadata:`, JSON.stringify(user.privateMetadata, null, 2));
        console.log(`   Public Metadata:`, JSON.stringify(user.publicMetadata, null, 2));

        const isAdminRole = user.privateMetadata?.role === "admin";
        console.log(`\n   Unknown Role Check: ${isAdminRole ? "✅ Is Admin (via metadata)" : "❌ Not Admin (via metadata)"}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.log("\n❌ Please provide an email address!");
    console.log("\n📝 Usage:");
    console.log("   node checkUser.js your-email@gmail.com");
    process.exit(1);
}

// Run the script
checkUser(email).then(() => {
    console.log("\n✨ Check completed!\n");
    process.exit(0);
});
