import express from 'express';
import dotenv from 'dotenv';
import user from './routes/user.js';
import cookieParser from 'cookie-parser';
import quote from './routes/quote.js';
import admin from './routes/admin.js';
import expert from './routes/expert.js';

const router = express.Router();

const app = express();

dotenv.config({
    path: '.env',
});

//using middlewares 
app.use(express.json());
app.use(cookieParser());

//using routes
app.use('/api/v1', user);
app.use('/api/v1', quote);
app.use('/api/v1', admin);
app.use('/api/v1', expert);





export default app;