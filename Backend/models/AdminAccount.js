import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminAccountSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminApplication", required: true },
        userId: { type: String, required: true }, // Clerk userId of the applicant
        role: { type: String, default: "admin" },
        lastLogin: { type: Date, default: null },
    },
    { timestamps: true }
);

// Hash password before saving
adminAccountSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminAccountSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const AdminAccount = mongoose.model("AdminAccount", adminAccountSchema);
export default AdminAccount;
