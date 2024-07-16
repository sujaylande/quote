import express from 'express';
import isAuthenticated  from '../middlewares/auth.js';
import Quote from '../models/Quote.js';
import { rejectQuoteByIdByAdmin, addExpert, getAllQuotesOfAdmin, moveQuoteToExpertByIdByAdmin, checkStatusOfQuote } from '../controllers/admin.js';
import isAdmin from '../middlewares/isAdmin.js';


const router = express.Router();

router.route('/add-expert').post(isAuthenticated, isAdmin, addExpert);

router.route('/get-all-quotes-ofadmin').get(isAuthenticated, isAdmin, getAllQuotesOfAdmin);

router.route('/reject-quote-byadmin-byid/:id').post(isAuthenticated, isAdmin, rejectQuoteByIdByAdmin);

router.route('/move-quote-experts/:id').get(isAuthenticated, isAdmin, moveQuoteToExpertByIdByAdmin);

router.route('/check-quote-status/:id').get(isAuthenticated, isAdmin, checkStatusOfQuote);






export default router;