import User from '../models/User.js';
import Quote from '../models/Quote.js';


const getAllQuotesOfExpert = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page, 10) || 1; // Default to 1 if not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not provided
        const skip = (page - 1) * limit; // Calculate skip based on page and limit

        // Find the admin to get the total number of complaints
        const expert = await User.findById(userId);
        

        const totalQuotes = expert.quotes.length;
        const totalPages = Math.ceil(totalQuotes / limit);

        // Check if the requested page exceeds the total number of pages
        if (page > totalPages) {
            return res.status(400).json({
                success: false,
                message: `Page ${page} exceeds total number of pages ${totalPages}`
            });
        }

        // Find the student again and populate the complaints array with pagination
        const expertwithquotes = await User.findById(userId).populate({
            path: 'quotes',
            options: {
                sort: { created_at: -1 },
                skip,
                limit
            }
        });

        res.status(200).json({
            success: true,
            quotes: expertwithquotes.quotes,
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

const updateQuoteStatus = async (req, res) => {
    try {
        const quoteId = req.params.id;
        const status = req.body.status; // 'Accepted', 'Rejected'

        if(status !== 'Accepted' && status !== 'Rejected'){
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Please enter either "Accepted" or "Rejected".'
            });
        }

        //loop on all quotes of expert and cheak if this quote is in expert quotes array
        let flag = 0;
        for(let i=0; i<req.user.quotes.length; i++){
            if(req.user.quotes[i] == quoteId){
                flag = 1;
                break;
            }
        }

        if(flag == 0){
            return res.status(400).json({
                success: false,
                message: 'Your are not Authorized to update status. Quote not found in expert quotes array'
            });
        }

        const quote = await Quote.findById(quoteId);

        const expertIndex = (req.user.index)-1; //to update stutus in quotes array of expert

        if(status == 'Accepted'){
            // Update the quote status to 'Accepted' and update the expert's quotes array
            quote.status[expertIndex] = 1;
            await quote.save();

            // Remove the quote from the expert's quotes array
            const ind = req.user.quotes.indexOf(req.params.id);
            req.user.quotes.splice(ind, 1); // delete post from expert's post array
            await req.user.save();

        }
        else{
            // Update the quote status to 'Rejected' and update the expert's quotes array
            quote.status[expertIndex] = 0;
            await quote.save();

            // Remove the quote from the expert's quotes array
            const ind = req.user.quotes.indexOf(req.params.id);
            req.user.quotes.splice(ind, 1); // delete post from expert's post array
            await req.user.save();
        }


        res.status(200).json({
            success: true,
            message: `Quote status updated successfully by ${quote.category} expert with index ${req.user.index}`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
}


export { getAllQuotesOfExpert, updateQuoteStatus };