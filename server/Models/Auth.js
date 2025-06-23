import mongoose from "mongoose";

const userschema=mongoose.Schema({
    email:{type:String,require:true},
    name:{type:String},
    desc:{type:String},
    city:{type:String}, // Added city field
    joinedon:{type:Date,default:Date.now}
})

export default mongoose.model("User",userschema)