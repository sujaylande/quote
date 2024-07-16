import sendMailToSuppliers from '../middlewares/nodeMail.js';
import User from '../models/User.js';
import Quote from '../models/Quote.js';


const addExpert = async (req, res) => {

    try {
        const { name, email, password, role, index } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'User already exists!'
                });
        }

        user = await User.create({ //create new user
            name,
            email,
            password,
            role, //category Expert ex: Media Expert, Health Expert
            index //index of the category
        });

        res.status(201).json({
            success: true,
            user
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

//get all quotes of admins
//get quotes by id
//reject quote by admin
//move quote to expert by admin


const getAllQuotesOfAdmin = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page, 10) || 1; // Default to 1 if not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not provided
        const skip = (page - 1) * limit; // Calculate skip based on page and limit

        // Find the admin to get the total number of complaints
        const admin = await User.findOne({role: 'Admin'});
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'admin not found'
            });
        }

        const totalQuotes = admin.quotes.length;
        const totalPages = Math.ceil(totalQuotes / limit);

        // Check if the requested page exceeds the total number of pages
        if (page > totalPages) {
            return res.status(400).json({
                success: false,
                message: `Page ${page} exceeds total number of pages ${totalPages}`
            });
        }

        // Find the student again and populate the complaints array with pagination
        const adminwithquotes = await User.findOne({role: 'Admin'}).populate({
            path: 'quotes',
            options: {
                sort: { created_at: -1 },
                skip,
                limit
            }
        });

        if (!adminwithquotes) {
            return res.status(404).json({
                success: false,
                message: 'Admin has no quotes'
            });
        }
        

        res.status(200).json({
            success: true,
            quotes: adminwithquotes.quotes,
            totalPages,
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};


const rejectQuoteByIdByAdmin = async (req, res) => {
    try {
        const post = await Quote.findById(req.params.id); // find post by id 

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        const { reasonforreject } = req.body;
        if (!reasonforreject) {
            return res.status(400).json({
                success: false,
                message: 'Missing reason for rejection'
            });
        }

        //const owner = await User.findById(post.owner); // find the owner of the post
        const owner = post.owner; // get the owner of the post

        //const admin = await User.findOne({ role: 'Admin' }); // find the admin
        const admin = req.user; // get the admin

        // Remove the quote from the admins's quotes array
        const index = admin.quotes.indexOf(req.params.id);
            admin.quotes.splice(index, 1); // delete post from admis's post array
            await admin.save();

        // Send email to the user
        const subject = 'Your Quote Has Been Rejected';
        const message = `Dear ${owner.name},\n\nYour quote has been rejected for the following reason:\n${reasonforreject}\n\nBest regards,\nAdmin`;

        await sendMailToSuppliers(owner.email, subject, message);

        res.status(200).json({
            success: true,
            message: 'Quote rejected and email sent to user'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const moveQuoteToExpertByIdByAdmin = async (req, res) => {
    try {
        const post = await Quote.findById(req.params.id); // find post by id 

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        const expertCategory = post.category+ ' Expert'; // get the expert category

        //console.log(expertCategory);

        const experts = await User.find({ role: expertCategory }); // find the expert

        //console.log(experts);

        if (!experts) {
            return res.status(404).json({
                success: false,
                message: 'Expert not found'
            });
        }

        //loop through all the experts and push this post to the expert's quotes array

        for (let i = 0; i < experts.length; i++) {
            experts[i].quotes.push(post);
            await experts[i].save();
        }

        res.status(200).json({
            success: true,
            message: `Quote is moved to  respective ${expertCategory}`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

//get by id from admin array who has status array not eaual -1, -1, -1 
//if sum >= 2 it means quote is approved otherwise rejected and send mail for the same


const checkStatusOfQuote = async (req, res) => {
    try {
        const post = await Quote.findById(req.params.id); // find post by id 

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        //check post belong to admin or not
        const quotes = req.user.quotes;
        let flag = 0;
        for (let i = 0; i < quotes.length; i++) {
            if (quotes[i] == req.params.id) {
                flag = 1;
                break;
            }
        }

        if (flag == 0) {
            return res.status(400).json({
                success: false,
                message: 'Your are not Authorized to check status. Quote not found in admin quotes array'   
            });
        }

        //make sure that all expert have given their opinion if altest one is -1 then quote is pending
        let pending = 0;
        //check status of the quote
        let sum = 0;
        for (let i = 0; i < post.status.length; i++) {
            sum += post.status[i];
            if (post.status[i] == -1) {
                pending = 1;
            }
        }

        if(pending == 1){
            return res.status(200).json({
                success: true,
                message: 'Quote is pending, all experts have not given their opinion yet'
            });
        }


        if (sum >= 2) {
            // Send email to the user
            const owner = await User.findById(post.owner); // find the owner of the post
            const subject = 'Your Quote Has Been Approved';
            const message = `Dear ${owner.name},\n\nYour quote has been approved.\n\nBest regards,\nAdmin`;

            await sendMailToSuppliers(owner.email, subject, message);

            //remove the quote from the admin's quotes array
            const index = req.user.quotes.indexOf(req.params.id);
            req.user.quotes.splice(index, 1); // delete post from admin's post array
            await req.user.save();

            res.status(200).json({
                success: true,
                message: 'Quote approved and email sent to user'
            });
        } else {
            // Send email to the user
            const owner = await User.findById(post.owner); // find the owner of the post
            const subject = 'Your Quote Has Been Rejected';
            const message = `Dear ${owner.name},\n\nYour quote has been rejected.\n\nBest regards,\nAdmin`;

            await sendMailToSuppliers(owner.email, subject, message);

            //remove the quote from the admin's quotes array
            const index = req.user.quotes.indexOf(req.params.id);
            req.user.quotes.splice(index, 1); // delete post from admin's post array
            await req.user.save();

            res.status(200).json({
                success: true,
                message: 'Quote rejected and email sent to user'
            });
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



export { addExpert, getAllQuotesOfAdmin, rejectQuoteByIdByAdmin, moveQuoteToExpertByIdByAdmin, checkStatusOfQuote };