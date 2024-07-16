import User from '../models/User.js';

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);


        if (user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admins only.'
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

export default isAdmin;
