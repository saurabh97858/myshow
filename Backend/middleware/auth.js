import { clerkClient, getAuth } from "@clerk/express";

import fs from 'fs';
import path from 'path';

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req); // Get auth from request

    if (!userId) {
      return res.json({ success: false, message: "Not authorized - No User ID" });
    }

    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (err) {
      console.error("Clerk Fetch Failed:", err);
      return res.json({ success: false, message: `Clerk Error: ${err.message} (Check CLERK_SECRET_KEY)` });
    }
    const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    // Check if any of the user's emails match the admin email or the hardcoded one
    const isEmailMatch = userEmails.includes(adminEmail) || userEmails.includes("saurabhgupta97858@gmail.com");
    const isAdminRole = user?.privateMetadata?.role === "admin";

    if (!isAdminRole && !isEmailMatch) {
      return res.json({
        success: false,
        message: `Not authorized. Role: ${user?.privateMetadata?.role}, Emails: ${userEmails.join(', ')}`
      });
    }

    next(); // user is admin, continue
  } catch (error) {
    console.error("protectAdmin error:", error.message);
    return res.json({ success: false, message: `Server error during admin check: ${error.message}` });
  }
};

