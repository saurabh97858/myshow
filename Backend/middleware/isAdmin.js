// Admin emails list
const ADMIN_EMAILS = [
    'saurabhgupta97858@gmail.com',
    // Add more admin emails here
];

export const isAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Get user from Clerk
        const { clerkClient } = await import('@clerk/express');
        const user = await clerkClient.users.getUser(userId);
        const userEmail = user.emailAddresses[0].emailAddress;

        // Check if user is admin
        if (!ADMIN_EMAILS.includes(userEmail)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        next();
    } catch (error) {
        console.error('isAdmin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization failed'
        });
    }
};
