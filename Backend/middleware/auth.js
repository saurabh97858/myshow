import { clerkClient } from "@clerk/express";

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth(); // Clerk middleware provides userId
    const user = await clerkClient.users.getUser(userId); // ✅ pass userId

    if (user?.privateMetadata?.role !== "admin") {
      return res.json({ success: false, message: "Not authorized" });
    }

    next(); // user is admin, continue
  } catch (error) {
    console.error("protectAdmin error:", error);
    return res.json({ success: false, message: "Server error" });
  }
};
