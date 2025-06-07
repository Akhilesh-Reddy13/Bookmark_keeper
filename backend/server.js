import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bookroute from './routes/bookmarkRoutes.js';
import dotenv from 'dotenv';

const app=express();
const PORT=process.env.PORT||5000;


dotenv.config();
app.use(express.json());
app.use(cors());

app.use('/api/bookmarks',bookroute);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> app.listen(PORT,()=> console.log(`Server running on ${PORT}`)))
.catch(err=>console.log(err));

