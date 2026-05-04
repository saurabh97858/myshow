import mongoose from "mongoose";

const adminApplicationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true }, // Clerk user ID
        name: { type: String, required: true },
        email: { type: String, required: true },
        contactNumber: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        registrationNumber: { type: String, required: true }, // Business registration
        theaterName: { type: String, required: true },
        theaterAddress: { type: String, required: true },
        additionalInfo: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        reviewedBy: { type: String, default: null }, // SuperAdmin userId who reviewed
        reviewNote: { type: String, default: "" },
        reviewedAt: { type: Date, default: null },
        adminAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminAccount", default: null },
    },
    { timestamps: true }
);

// Prevent duplicate applications from same user
adminApplicationSchema.index({ userId: 1, status: 1 });

const AdminApplication = mongoose.models.AdminApplication || mongoose.model('AdminApplication', adminApplicationSchema);
export default AdminApplication;
