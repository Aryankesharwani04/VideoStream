import comment from "../Models/comment.js";
import mongoose from "mongoose";
import users from "../Models/Auth.js";

export const postcomment = async (req, res) => {
    const { videoid, commentbody } = req.body;
    const userid = req.userid;
    // Validate: no special characters
    if (/[^\w\s.,!?'-]/.test(commentbody)) {
        return res.status(400).json("Comment contains invalid special characters.");
    }
    // Get user info for city and name
    const user = await users.findById(userid);
    if (!user) return res.status(400).json("User not found");
    const postcomment = new comment({
        videoid,
        userid,
        commentbody,
        usercommented: user.name,
        city: user.city
    });
    try {
        await postcomment.save();
        res.status(200).json("posted the comment");
    } catch (error) {
        res.status(400).json(error.message);
        return;
    }
}

export const getcomment = async (req, res) => {
    try {
        const commentlist = await comment.find();
        // Attach city and user name to each comment
        const result = await Promise.all(commentlist.map(async (c) => {
            const user = await users.findById(c.userid);
            return {
                ...c._doc,
                usercommented: user?.name,
                city: user?.city
            };
        }));
        res.status(200).send(result);
    } catch (error) {
        res.status(400).json(error.message);
        return;
    }
}

export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }
    try {
        await comment.findByIdAndDelete(_id);
        res.status(200).json({ message: "deleted comment" })
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..")
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(
            _id,
            { $set: { "commentbody": commentbody } }
        )
        res.status(200).json(updatecomment)
    } catch (error) {
        res.status(400).json(error.message)
        return
    }
}

// Like a comment
export const likeComment = async (req, res) => {
    const { id } = req.params;
    const userid = req.userid;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Comment unavailable..");
    }
    try {
        const c = await comment.findById(id);
        if (!c.likes.includes(userid)) c.likes.push(userid);
        c.dislikes = c.dislikes.filter((d) => d !== userid);
        await c.save();
        res.status(200).json({ likes: c.likes.length, dislikes: c.dislikes.length });
    } catch (error) {
        res.status(400).json(error.message);
    }
};
// Dislike a comment and auto-delete if 2 dislikes
export const dislikeComment = async (req, res) => {
    const { id } = req.params;
    const userid = req.userid;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Comment unavailable..");
    }
    try {
        const c = await comment.findById(id);
        if (!c.dislikes.includes(userid)) c.dislikes.push(userid);
        c.likes = c.likes.filter((l) => l !== userid);
        if (c.dislikes.length >= 2) {
            await comment.findByIdAndDelete(id);
            return res.status(200).json({ message: "Comment auto-removed due to dislikes." });
        }
        await c.save();
        res.status(200).json({ likes: c.likes.length, dislikes: c.dislikes.length });
    } catch (error) {
        res.status(400).json(error.message);
    }
};
// Dummy translation endpoint (replace with real API integration)
export const translateComment = async (req, res) => {
    const { id } = req.params;
    const { targetLang } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Comment unavailable..");
    }
    try {
        const c = await comment.findById(id);
        // Here you would call a translation API
        // For now, just return the same commentbody
        res.status(200).json({ translated: c.commentbody, lang: targetLang });
    } catch (error) {
        res.status(400).json(error.message);
    }
};