import { clerkClient, getAuth } from "@clerk/express";

import fs from 'fs';
import path from 'path';

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req); // Get auth from request

    console.log(`\n🛡️ Admin Check Debug:`);
    console.log(`   User ID from Request: ${userId}`);

    if (!userId) {
      console.log(`❌ No User ID found in request.`);
      return res.json({ success: false, message: "Not authorized - No User ID" });
    }

    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (err) {
      console.error("❌ Clerk User Fetch Failed:", err.message);
      return res.json({ success: false, message: `Clerk Error: ${err.message} (Check CLERK_SECRET_KEY)` });
    }

    const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const userRole = user.privateMetadata?.role;

    console.log(`   User Emails: ${JSON.stringify(userEmails)}`);
    console.log(`   Expected Admin Email: ${adminEmail}`);
    console.log(`   Hardcoded Admin Email: saurabhgupta97858@gmail.com`);
    console.log(`   User Role (Metadata): ${userRole}`);

    // Check if any of the user's emails match the admin email or the hardcoded one
    const isEmailMatch = userEmails.includes(adminEmail) || userEmails.includes("saurabhgupta97858@gmail.com");
    const isAdminRole = userRole === "admin";

    console.log(`   Email Match: ${isEmailMatch}`);
    console.log(`   Role Match: ${isAdminRole}`);

    if (!isAdminRole && !isEmailMatch) {
      console.log(`❌ Access Denied.`);
      return res.json({
        success: false,
        message: `Not authorized. Role: ${userRole}, Emails: ${userEmails.join(', ')}`
      });
    }

    console.log(`✅ Access Granted.`);
    next(); // user is admin, continue
  } catch (error) {
    console.error("protectAdmin error:", error.message);
    return res.json({ success: false, message: `Server error during admin check: ${error.message}` });
  }
};

