import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {type: String,required:true},
  password: {type:String, required:true},
  role:{type:String,default:'user'},
  addedBookmarks: [{type: mongoose.Schema.Types.ObjectId,ref:'Bookmark'}]
});

const user=mongoose.model('user',userSchema);

export default user;
