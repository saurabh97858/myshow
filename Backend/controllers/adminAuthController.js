import jwt from "jsonwebtoken";
import AdminAccount from "../models/AdminAccount.js";
import AdminApplication from "../models/AdminApplication.js";

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }

        const admin = await AdminAccount.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Create custom JWT
        const token = jwt.sign(
            { id: admin._id, userId: admin.userId, role: "admin", type: "custom_admin" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                userId: admin.userId
            }
        });
    } catch (error) {
        console.error("adminLogin error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.id;

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: "Current and new passwords are required" });
        }

        const admin = await AdminAccount.findById(adminId);
        if (!admin) {
            return res.json({ success: false, message: "Admin account not found" });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect current password" });
        }

        admin.password = newPassword;
        await admin.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("changeAdminPassword error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
