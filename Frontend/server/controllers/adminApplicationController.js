import AdminApplication from "../models/AdminApplication.js";
import AdminAccount from "../models/AdminAccount.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { getAuth } from "@clerk/express";

// Helper: get userId from either custom auth or Clerk
const getUserId = (req) => {
    if (req.isCustomAuth && req.customAuthUserId) return req.customAuthUserId;
    const auth = getAuth(req);
    return auth?.userId;
};

// Submit admin application (any logged-in user)
export const submitApplication = async (req, res) => {
    try {
        const userId = getUserId(req);
        const {
            name, email, contactNumber, address, city, state,
            registrationNumber, theaterName, theaterAddress, additionalInfo
        } = req.body;

        // Validate required fields
        if (!name || !email || !contactNumber || !address || !city || !state || !registrationNumber || !theaterName || !theaterAddress) {
            return res.json({ success: false, message: "All required fields must be filled" });
        }

        // Check if user already has a pending/approved application
        const existing = await AdminApplication.findOne({
            userId,
            status: { $in: ["pending", "approved"] }
        });

        if (existing) {
            if (existing.status === "approved") {
                return res.json({ success: false, message: "You are already an approved admin" });
            }
            return res.json({ success: false, message: "You already have a pending application" });
        }

        const application = await AdminApplication.create({
            userId,
            name,
            email,
            contactNumber,
            address,
            city,
            state,
            registrationNumber,
            theaterName,
            theaterAddress,
            additionalInfo: additionalInfo || "",
        });

        // Create notification for the user
        await Notification.create({
            user: userId,
            type: "admin_application",
            title: "Admin Application Submitted",
            message: "Your admin application has been submitted successfully. We will review it shortly.",
            data: { applicationId: application._id }
        });

        // Emit socket event
        if (global.io) {
            global.io.to(userId).emit('new-notification', {
                type: 'admin_application',
                title: 'Admin Application Submitted',
                message: 'Your application is under review.'
            });
        }

        res.json({ success: true, message: "Application submitted successfully", application });
    } catch (error) {
        console.error("submitApplication error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current user's application status
export const getMyApplication = async (req, res) => {
    try {
        const userId = getUserId(req);

        const application = await AdminApplication.findOne({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            application: application || null,
        });
    } catch (error) {
        console.error("getMyApplication error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all applications (Super Admin only)
export const getAllApplications = async (req, res) => {
    try {
        const applications = await AdminApplication.find()
            .sort({ createdAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        console.error("getAllApplications error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve application (Super Admin only)
export const approveApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const { reviewNote, adminEmail, adminPassword } = req.body;

        if (!adminEmail || !adminPassword) {
            return res.json({ success: false, message: "Admin email and password are required for approval" });
        }

        const application = await AdminApplication.findById(id);
        if (!application) {
            return res.json({ success: false, message: "Application not found" });
        }

        if (application.status !== "pending") {
            return res.json({ success: false, message: `Application is already ${application.status}` });
        }

        // Create Admin Account first to ensure credentials are valid
        try {
            const adminAccount = await AdminAccount.create({
                email: adminEmail,
                password: adminPassword,
                applicationId: application._id,
                userId: application.userId
            });

            // Update application status
            application.status = "approved";
            application.reviewedBy = userId;
            application.reviewNote = reviewNote || "Approved";
            application.reviewedAt = new Date();
            application.adminAccountId = adminAccount._id;
            await application.save();

        } catch (error) {
            if (error.code === 11000) {
                return res.json({ success: false, message: "An admin account with this email already exists" });
            }
            throw error;
        }

        // Update user role to admin (backward compatibility)
        await User.findByIdAndUpdate(application.userId, { role: "admin" });

        // Send notification to the applicant
        await Notification.create({
            user: application.userId,
            type: "admin_application",
            title: "🎉 Admin Application Approved!",
            message: `Congratulations! Your admin application has been approved. You can now login with the credentials provided by the super admin.`,
            data: { applicationId: application._id }
        });


        // Emit socket event
        if (global.io) {
            global.io.to(application.userId).emit('new-notification', {
                type: 'admin_application',
                title: 'Application Approved!',
                message: 'Your admin application has been approved!'
            });
        }

        res.json({ success: true, message: "Application approved successfully", application });
    } catch (error) {
        console.error("approveApplication error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject application (Super Admin only)
export const rejectApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const { reviewNote } = req.body;

        const application = await AdminApplication.findById(id);
        if (!application) {
            return res.json({ success: false, message: "Application not found" });
        }

        if (application.status !== "pending") {
            return res.json({ success: false, message: `Application is already ${application.status}` });
        }

        // Update application status
        application.status = "rejected";
        application.reviewedBy = userId;
        application.reviewNote = reviewNote || "Rejected";
        application.reviewedAt = new Date();
        await application.save();

        // Send notification to the applicant
        await Notification.create({
            user: application.userId,
            type: "admin_application",
            title: "Admin Application Update",
            message: `Your admin application has been reviewed and was not approved at this time.${reviewNote ? ` Reason: ${reviewNote}` : ''} You can submit a new application later.`,
            data: { applicationId: application._id }
        });

        // Emit socket event
        if (global.io) {
            global.io.to(application.userId).emit('new-notification', {
                type: 'admin_application',
                title: 'Application Not Approved',
                message: 'Your admin application was not approved.'
            });
        }

        res.json({ success: true, message: "Application rejected", application });
    } catch (error) {
        console.error("rejectApplication error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
