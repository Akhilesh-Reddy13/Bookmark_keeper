import express from "express";
import jwt from 'jsonwebtoken';
import Bookmark from '../models/Bookmark.js';
import User from '../models/user.js';
const router=express.Router();

const secretKey='hsbfjbfdnXCGERG';

const authenicateJwt=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(authHeader){
        const token= authHeader.split(' ')[1];
        jwt.verify(token,secretKey,(err,user)=>{
            if(err){
                return res.sendStatus(403);
            }
            req.user=user;
            next();
        });
    }
    else{
        res.sendStatus(401);
    }
};
router.post('/users/signup',async (req,res)=>{
    try{
    const {username,password}=req.body;
    const user= await User.findOne({username});
    if(user){
        res.status(403).json({message:'User already exists'});
    }
    else{
        const newUser=new User({username,password});
        await newUser.save();
        const token=jwt.sign({username,role:'user'},secretKey,{expiresIn:'1h'});
        res.json({message:'User created successfully',token});
    }}
    catch(error){
        console.error(error);
        res.status(500).json({message:"Internal server Error"});
    }
});

router.post('/users/login',async(req,res)=>{
    const {username,password}=req.headers;
    const user=await User.findOne({username,password});
    if(user){
        const token=jwt.sign({username,role:'user'},secretKey,{expiresIn:'1h'});
        res.json({message:'Logged in succesfully',token});
    }
    else{
        res.status(403).json({message:'Invalid username or password'});
    }
});

router.get('/',authenicateJwt,async (req,res) =>{
    const bookmarks = await Bookmark.find();
    res.json(bookmarks);
});

router.get('/:id',authenicateJwt,async (req,res)=>{
   try {
        const bookmark = await Bookmark.findById(req.params.id);
        if (!bookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }
        res.json(bookmark);
    } catch (error) {
        console.error(error);
        // If the ID format is invalid
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid bookmark ID format' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/',async (req,res)=>{
    const newBookmark= new Bookmark(req.body);
    await newBookmark.save();
    res.status(201).json(newBookmark);
});

router.put('/:id',authenicateJwt, async (req, res) => {
  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBookmark) {
            return res.status(404).json({ message: 'Bookmark not found' });
        }
    res.json(updatedBookmark);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bookmark' });
  }
});

router.delete('/:id',authenicateJwt, async (req,res) =>{
    try{
    const deletedBookmark=await Bookmark.findByIdAndDelete(req.params.id);
    if(!deletedBookmark){
        return res.status(404).json({message:"Bookmark not found"});
    }
    res.json({message:'Bookmark Deleted'});
    }
    catch(error){
        return  res.status(400).json({ error: 'Invalid bookmark ID format' });
    }
});

export default router;
