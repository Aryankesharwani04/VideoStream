import mongoose from "mongoose";

const commentschema = mongoose.Schema({
    videoid: String,
    userid: String,
    commentbody: String,
    usercommented: String,
    city: String, // Add city field
    likes: { type: [String], default: [] }, // User IDs who liked
    dislikes: { type: [String], default: [] }, // User IDs who disliked
    commentedon: { type: Date, default: Date.now }
})
export default mongoose.model("Comments", commentschema)