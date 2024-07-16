import express from 'express';
import isAuthenticated  from '../middlewares/auth.js';
import Quote from '../models/Quote.js';
import { getAllQuotesOfExpert, updateQuoteStatus } from '../controllers/expert.js';
import isExpert from '../middlewares/isExpert.js';


const router = express.Router();


router.route('/getall-quotes-ofexpert').get(isAuthenticated, isExpert, getAllQuotesOfExpert);

router.route('/update-quotes-status/:id').post(isAuthenticated, isExpert, updateQuoteStatus);




export default router;