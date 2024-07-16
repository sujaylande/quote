import express from 'express';
import isAuthenticated  from '../middlewares/auth.js';
import { createQuote, deleteQuoteById, getAllQuotes } from '../controllers/quote.js';
import isUser from '../middlewares/isUser.js';


const router = express.Router();

router.route('/create-quote').post(isAuthenticated, isUser, createQuote);

router.route('/delete-quote-byid/:id').delete(isAuthenticated, isUser, deleteQuoteById);

router.route('/get-all-quotes').get(isAuthenticated, isUser, getAllQuotes);


export default router;