import Quote from '../models/Quote.js';
import User from '../models/User.js';


const createQuote = async (req, res) => {

    try {
        const newPostData = {
            quotefilelink: req.body.quotefilelink,
            category: req.body.category,
            owner: req.user._id
        }


        const quote = await Quote.create(newPostData);

        const user = await User.findById(req.user._id);
        //console.log(user);

        user.quotes.push(quote._id);

        //add quote to admis array of quotes

        const admin = await User.findOne({ role: 'Admin' });

        admin.quotes.push(quote._id);

        await admin.save();

        await user.save();

        res.status(201).json({
            success: true,
            quote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const deleteQuoteById = async (req, res) => {
    try{                                       //params is used to get the id from the url
        const post = await Quote.findById(req.params.id); //find post by id 

        if(!post){
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if(post.owner.toString() !== req.user._id.toString()){ //check if the post belongs to the user
            return res.status(401).json({
                success: false,
                message: 'You are not authorized to delete this quote'
            });
        }

        await post.deleteOne(); //remove is deprecated and no need to give id

        const user = await User.findById(req.user._id); //current user who is logged in

        const index = user.quotes.indexOf(req.params.id);

        user.quotes.splice(index, 1); //delete post from user's post array

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Quote deleted'
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const getAllQuotes = async (req, res) => {
    try {
        // Assuming req.user._id contains the ID of the authenticated user
        const userId = req.user._id;

        const page = parseInt(req.query.page, 10) || 1; // Default to 1 if not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not provided

        const skip = (page - 1) * limit; // Calculate skip based on page and limit

        // Find posts with pagination and populate the owner field
        const quote = await Quote.find({ owner: userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Counting total posts of the user
        const count = await Quote.countDocuments({ owner: userId });

        const totalPages = Math.ceil(count / limit);

        if (quote.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No posts found',
            });
        }

        res.status(200).json({
            success: true,
            quote,
            totalPages,
            currentPage: page,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};


export { createQuote, deleteQuoteById, getAllQuotes};