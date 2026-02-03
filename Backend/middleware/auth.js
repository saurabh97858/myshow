import { clerkClient, getAuth } from "@clerk/express";

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req); // Get auth from request

    if (!userId) {
      return res.json({ success: false, message: "Not authorized - No User ID" });
    }

    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.emailAddresses[0].emailAddress;

    if (user?.privateMetadata?.role !== "admin" && primaryEmail !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Not authorized - Not Admin" });
    }

    next(); // user is admin, continue
  } catch (error) {
    console.error("protectAdmin error:", error.message);
    return res.json({ success: false, message: "Server error" });
  }
};

