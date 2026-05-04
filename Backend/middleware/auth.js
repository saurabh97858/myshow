import { clerkClient, getAuth } from "@clerk/express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AdminAccount from "../models/AdminAccount.js";
import fs from "fs";
import path from "path";

const debugLog = (msg) => {
    /*
    try {
        const logPath = path.join(process.cwd(), "auth_debug.txt");
        fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`);
    } catch (err) {
        console.error("Failed to write debug log:", err.message);
    }
    */
    console.log(`[AuthDebug] ${msg}`);
};

// Middleware to protect admin routes (allows Clerk Admin/SuperAdmin OR Custom Admin Account)
export const protectAdmin = async (req, res, next) => {
  try {
    // 1. Check for Custom Admin Token (Highest priority for theater admins)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        if (decoded && decoded.type === "custom_admin") {
          const admin = await AdminAccount.findById(decoded.id);
          if (admin) {
            req.admin = admin;
            req.userRole = "admin";
            req.isCustomAuth = true;
            return next();
          }
        }
      } catch (err) {
        // If it was a custom admin token but expired/invalid, we could log it
        // but we'll fall through to check Clerk auth anyway
      }
    }

    // 2. Check for Clerk Auth
    const auth = getAuth(req);
    const { userId } = auth;
    
    console.log(`📡 [protectAdmin] MiddleWare Auth Check - UID: ${userId} | Headers: ${authHeader?.substring(0, 30)}...`);
    if (!userId) {
      console.warn(`   ❌ No userId found. AuthHeader length: ${authHeader?.length || 0}`);
      debugLog(`   ❌ No userId found in Clerk auth. AuthHeader length: ${authHeader?.length || 0}`);
      if (authHeader && authHeader.length > 50) {
          debugLog("   ⚠️ Token sent but Clerk did not provide UID. Returning 401 equivalent.");
          return res.json({ success: false, message: "Invalid or expired session. Please login again.", debug: { hasAuth: !!req.auth, hasUserId: !!userId } });
      }
      return res.json({ success: false, message: "Not authorized - Login Required" });
    }

    // 3. Check role from database (Fastest)
    const dbUser = await User.findById(userId);
    
    if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'superadmin')) {
      req.userRole = dbUser.role;
      req.dbUser = dbUser;
      req.authUserId = userId;
      console.log(`✅ [protectAdmin] DB Role Found: ${dbUser.role}`);
      return next();
    }

    console.log(`⚠️ [protectAdmin] Role not in DB for ${userId}, checking Clerk...`);

    // 4. Fallback: check Clerk email (Slower, but only done once or if role not set)
    // Guard against empty userId to prevent Clerk errors
    if (!userId || typeof userId !== 'string') {
        return res.json({ success: false, message: "Invalid User Session" });
    }

    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (err) {
      console.error("Clerk getUser error:", err);
      // If Clerk fails, we can't verify superadmin fallback
    }

    if (user) {
        const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
        const adminEmail = process.env.ADMIN_EMAIL?.replace(/['"]/g, '').toLowerCase().trim();
        
        console.log(`📧 [protectAdmin] Email Sync - User: [${userEmails.join(",")}] | Target Admin: [${adminEmail}]`);

        if (adminEmail && userEmails.includes(adminEmail)) {
            console.log("🌟 [protectAdmin] MATCH FOUND! Syncing to DB as superadmin...");
            
            // Auto-create or update user in DB
            if (dbUser) {
                if (dbUser.role !== 'superadmin') {
                    console.log(`   ⬆️ Elevating user ${dbUser.email} from ${dbUser.role} to superadmin`);
                    dbUser.role = 'superadmin';
                    await dbUser.save();
                }
                req.dbUser = dbUser;
            } else {
                // Create user if they don't exist in DB yet
                console.log(`   ✨ Creating NEW superadmin record for ${adminEmail}`);
                const newUser = await User.create({
                    _id: userId,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || "Super Admin",
                    email: adminEmail,
                    image: user.imageUrl || "",
                    role: 'superadmin'
                });
                req.dbUser = newUser;
            }
            
            req.userRole = 'superadmin';
            req.authUserId = userId;
            return next();
        } else {
            console.log(`   🚫 No email match found for superadmin elevation. UserEmails: ${userEmails.join(",")}`);
        }
    }

    console.warn(`   ❌ protectAdmin: Final fallthrough - User: ${userId}, Role: ${req.userRole}`);
    return res.status(401).json({ success: false, message: "Not authorized. Access denied." });
  } catch (error) {
    console.error("protectAdmin error:", error.message);
    return res.json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Middleware to protect routes that specifically require custom Admin Account auth
export const protectCustomAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    if (!decoded || decoded.type !== "custom_admin") {
      return res.json({ success: false, message: "Invalid token type" });
    }

    const admin = await AdminAccount.findById(decoded.id);
    if (!admin) {
      return res.json({ success: false, message: "Admin account no longer exists" });
    }

    req.admin = admin;
    req.userRole = "admin";
    req.isCustomAuth = true;
    next();
  } catch (error) {
    console.error("protectCustomAdmin error:", error.message);
    return res.json({ success: false, message: "Authentication failed. Please login again." });
  }
};

// Middleware to protect super admin only routes
export const protectSuperAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.json({ success: false, message: "Not authorized - No User ID" });
    }

    const dbUser = await User.findById(userId);

    // 1. Check database role first (Fastest)
    if (dbUser && dbUser.role === 'superadmin') {
      req.userRole = 'superadmin';
      req.dbUser = dbUser;
      return next();
    }

    // 2. Fallback: check Clerk email
    if (!userId || typeof userId !== 'string') {
        return res.json({ success: false, message: "Invalid User Session" });
    }

    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (err) {
      console.error("Clerk getUser error in protectSuperAdmin:", err);
    }

    if (user) {
        const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

        if (adminEmail && userEmails.includes(adminEmail)) {
            if (dbUser) {
                if (dbUser.role !== 'superadmin') {
                    dbUser.role = 'superadmin';
                    await dbUser.save();
                }
                req.dbUser = dbUser;
            } else {
                // Create user if not exists
                const newUser = await User.create({
                    _id: userId,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || "Super Admin",
                    email: adminEmail,
                    image: user.imageUrl || "",
                    role: 'superadmin'
                });
                req.dbUser = newUser;
            }
            req.userRole = 'superadmin';
            return next();
        }
    }

    return res.json({ success: false, message: "Super Admin access only." });
  } catch (error) {
    console.error("protectSuperAdmin error:", error.message);
    return res.json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Middleware to specifically require any authenticated user (replaces Clerk's built-in requireAuth)
// IMPORTANT: Do NOT overwrite req.auth — Clerk sets it as a function in Express 5,
// and getAuth(req) relies on it. Overwriting causes "req.auth is not a function" crashes.
export const requireAnyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 1. Check for Custom Admin Token FIRST (Highest priority)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        if (decoded && decoded.type === "custom_admin") {
          const admin = await AdminAccount.findById(decoded.id);
          if (admin) {
            req.admin = admin;
            req.userRole = "admin";
            req.isCustomAuth = true;
            // Store custom auth userId separately — do NOT overwrite req.auth
            req.customAuthUserId = `admin_${admin._id}`;
            console.log(`✅ [requireAnyAuth] Authenticated via Custom Admin Token: ${admin.email}`);
            return next();
          }
        }
      } catch (err) {
        // Token might be a Clerk JWT, so we fall through silently
      }
    }

    // 2. Fallback to Clerk Auth
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      console.warn(`🚫 [requireAnyAuth] Denied access to ${req.url} - No userId. AuthHeader length: ${authHeader?.length || 0}`);
      
      const message = (authHeader && authHeader.length > 50) 
        ? "Your session has expired or is invalid. Please login again." 
        : "Authentication required. Please login.";

      return res.status(401).json({ 
        success: false, 
        message,
      });
    }

    // Do NOT set req.auth = auth — it would overwrite Clerk's function and break getAuth()
    console.log(`✅ [requireAnyAuth] Authenticated via Clerk: ${auth.userId}`);
    next();
  } catch (err) {
    console.error("requireAnyAuth error:", err);
    res.status(500).json({ success: false, message: "Internal Auth Error" });
  }
};
