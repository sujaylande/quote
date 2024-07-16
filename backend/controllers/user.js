import User from '../models/User.js';
import Quote from '../models/Quote.js';

const register = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        //if user already exists redirect to login page
        if (user) {
            return res
                .status(200)
                .json({
                    success: true,
                    message: 'User already exists! Please login'
                });
        }

        user = await User.create({ //create new user
            name,
            email,
            password,
        });

        //regiser plus login both at same time
        const token = await user.generateToken();

        res.status(201).cookie("token", token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
            httpOnly: true
        }).json({
            success: true,
            user,
            token
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        //models mde select false kela hota so select true karayla lagto password sathi
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: 'User not found!'
                });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'Incorrect password'
                });
        }

        const token = await user.generateToken();

        res.status(201).cookie("token", token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days
            httpOnly: true
        }).json({
            success: true,
            user,
            token
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const logout = async (req, res) => {

    try {
        res.cookie("token", "", { //set token to empty string
            expires: new Date(Date.now()), 
            httpOnly: true
        }).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



const deleteMyProfile = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);

        const postsLen = user.quotes.length;

        const userId = user._id;

        await user.deleteOne();

        //log out user after removing profile othewise app will crash
        res.cookie("token", "", { //set token to empty string
            expires: new Date(Date.now()), 
            httpOnly: true
        });

        //delete all posts of user
        for(let i=0; i<postsLen; i++) {
            await Quote.findByIdAndDelete(user.posts[i]);
        }

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const myProfile = async (req, res) => {

    try{
        const user = await User.findById(req.user._id).populate('quotes');
        res.status(200).json({
            success: true,
            user,
        });
    } catch(error){
        res.status(500).json({
            success: false,
            massage: error.message,
        });
    }
}


export { register, login, logout, deleteMyProfile, myProfile };
