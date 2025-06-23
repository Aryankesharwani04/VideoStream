import express from "express";
import { likeComment, dislikeComment, translateComment } from "../Controllers/Comment.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.patch("/like/:id", auth, likeComment);
router.patch("/dislike/:id", auth, dislikeComment);
router.post("/translate/:id", auth, translateComment);

export default router;
