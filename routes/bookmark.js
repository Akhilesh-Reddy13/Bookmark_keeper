import express from "express";
import Bookmark from '../models/Bookmark.js';
const router=express.Router();

router.get('/',async (req,res) =>{
    const bookmarks = await Bookmark.find();
    res.json(bookmarks);
});

router.get('/:id',async (req,res)=>{
    const bookmark=await Bookmark.findById(req.params.id);
    res.json(bookmark);
});

router.post('/',async (req,res)=>{
    const newBookmark= new Bookmark(req.body);
    await newBookmark.save();
    res.status(201).json(newBookmark);
});

router.put('/:id', async (req, res) => {
  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBookmark);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bookmark' });
  }
});

router.delete('/:id', async (req,res) =>{
    try{
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({message:'Bookmark Deleted'});
    }
    catch(error){
         res.status(400).json({ error: 'Unable to find bookmark' });
    }
});

export default router;
