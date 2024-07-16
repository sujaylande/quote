import User from '../models/User.js';

const isExpert = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);


        const expertRoles = ['Sports Expert', 'Media Expert', 'Politics Expert']; // Add all expert roles here

        if (!expertRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Experts only.'
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



export default isExpert;
