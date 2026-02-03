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

    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.emailAddresses[0].emailAddress;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Debug Logging
    const logMessage = `[${new Date().toISOString()}] UserID: ${userId} | Email: ${primaryEmail} | AdminEmailEnv: ${adminEmail} | Role: ${user?.privateMetadata?.role}\n`;
    console.log("AUTH DEBUG:", logMessage);
    try {
      fs.appendFileSync(path.join(process.cwd(), 'logs', 'debug_auth.txt'), logMessage);
    } catch (err) {
      // Create logs dir if not exists
      if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
        fs.mkdirSync(path.join(process.cwd(), 'logs'));
        fs.appendFileSync(path.join(process.cwd(), 'logs', 'debug_auth.txt'), logMessage);
      }
    }

    const isEmailMatch = adminEmail && primaryEmail.toLowerCase() === adminEmail.toLowerCase();
    const isAdminRole = user?.privateMetadata?.role === "admin";

    if (!isAdminRole && !isEmailMatch) {
      return res.json({ success: false, message: "Not authorized - Not Admin" });
    }

    next(); // user is admin, continue
  } catch (error) {
    console.error("protectAdmin error:", error.message);
    return res.json({ success: false, message: "Server error" });
  }
};

