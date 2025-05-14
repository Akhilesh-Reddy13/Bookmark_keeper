import mongoose from "mongoose";

const bookmarkSchema= new mongoose.Schema({
    title:{type:String,required:true},
    url:{type:String,required:true},
    description:String,
    tags:[String],
    createdAt:{ type:Date,default:Date.now}
});

const Bookmark=mongoose.model('Bookmark',bookmarkSchema);

export default Bookmark;