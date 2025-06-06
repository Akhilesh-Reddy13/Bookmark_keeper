import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Bookmark from '../models/Bookmark.js';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();
const router=express.Router();

const secretKey=process.env.JWT_KEY;

const authenicateJwt=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(authHeader){
        const token= authHeader.split(' ')[1];
        if(!secretKey){
            console.error('Secret key is not defined');
            return res.status(500).json({message:'Server Configuration error'});
        }
        jwt.verify(token,secretKey,(err,user)=>{
            if(err){
                console.error('JWT verification error:',err);
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
        const hpassword= await bcrypt.hash(password,10);
        const newUser=new User({username,password:hpassword});
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
    const user=await User.findOne({username});
    if(user && await bcrypt.compare(password,user.password)){
        const token=jwt.sign({username,role:'user'},secretKey,{expiresIn:'1h'});
        res.json({message:'Logged in succesfully',token});
    }
    else{
        res.status(403).json({message:'Invalid username or password'});
    }
});

router.get('/',authenicateJwt,async (req,res) =>{
    try{
    const user= await User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const bookmarks= await Bookmark.find({_id:{$in: user.addedBookmarks}});
    res.json(bookmarks);
    }catch(error){
        console.error("Error fetching bookmarks:",error);
        res.status(500).json({message:'Failed to fetch bookmarks'});
    }
});

router.get('/:id',authenicateJwt,async (req,res)=>{
   try {
        const user=await User.findOne({username:req.user.username});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(!user.addedBookmarks.includes(req.params.id)){
            return res.status(403).json({message:"Access denied: Not your bookmark"});
        }
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

router.post('/',authenicateJwt,async (req,res)=>{
    try{
     const newBookmark= new Bookmark(
        {...req.body,
        owner:req.user.username
    });

    const savedBookmark=await newBookmark.save();
    await User.findOneAndUpdate(
        {username:req.user.username},
        {$push:{addedBookmarks: savedBookmark._id}});
    res.status(201).json(savedBookmark);
    }catch (error) {
        console.error('Error creating bookmark:', error);
        res.status(500).json({ message: 'Failed to create bookmark' });
    }
});

router.put('/:id',authenicateJwt, async (req, res) => {
  try {
     const user = await User.findOne({ username: req.user.username });
    
     if (!user.addedBookmarks.includes(req.params.id)){
            return res.status(403).json({ message: 'Access denied: Not your bookmark' });
    }
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
    const user = await User.findOne({ username: req.user.username });
        
    if (!user.addedBookmarks.includes(req.params.id)) {
            return res.status(403).json({ message: 'Access denied: Not your bookmark' });
    }
    const deletedBookmark=await Bookmark.findByIdAndDelete(req.params.id);

    if(!deletedBookmark){
        return res.status(404).json({message:"Bookmark not found"});
    }
    await User.findOneAndUpdate(
            { username: req.user.username },
            { $pull: { addedBookmarks: req.params.id } }
    );
    res.json({message:'Bookmark Deleted'});
    }
    catch(error){
        return  res.status(400).json({ error: 'Invalid bookmark ID format' });
    }
});

export default router;
