import User from "../models/userModel.js";

// Admin check middleware (used in some routes)
export const isAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Valid Session Required'
            });
        }

        // 1. Check database role (Fastest)
        const dbUser = await User.findById(userId);
        
        if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'superadmin')) {
            req.userRole = dbUser.role;
            return next();
        }

        // 2. Fallback: check ADMIN_EMAIL env (Expensive Clerk call)
        const { clerkClient } = await import('@clerk/express');
        let user;
        try {
            user = await clerkClient.users.getUser(userId);
        } catch (clerkErr) {
            console.error('Clerk getUser error in isAdmin middleware:', clerkErr);
        }

        if (user) {
            const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
            const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

            if (adminEmail && userEmail === adminEmail) {
                // Auto-set superadmin role
                if (dbUser && dbUser.role !== 'superadmin') {
                    dbUser.role = 'superadmin';
                    await dbUser.save();
                }
                req.userRole = 'superadmin';
                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    } catch (error) {
        console.error('isAdmin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization failed'
        });
    }
};
