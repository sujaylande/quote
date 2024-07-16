import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isAuthenticated = async (req, res, next) => {

   try{
    //for this we need to import cookie-parser
    const {token} = req.cookies; //this will give the token from the cookie
    
    //console.log(token);

    if(!token) {
        return res.status(401).json({message: 'Please login first'});
    }

    //now decoded cantain the user id who is currently logged in
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

   // console.log(decoded);
    //console.log(decoded._id);

    req.user = await User.findById(decoded._id); //this will give the user who is currently logged in

    //console.log(req.user);

    next();
   }catch(err){
    res.status(500).json({
        success: false,
        message: err.message
    });
   }
};

export default isAuthenticated;

