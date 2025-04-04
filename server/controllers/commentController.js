import Comment from "../models/comment.js";
import mongoose from "mongoose";

const createComment = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Comment text is required" });
  }

  // Validate postId is a valid ObjectId
  if (
    !req.params.postId ||
    !mongoose.Types.ObjectId.isValid(req.params.postId)
  ) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    const comment = new Comment({
      text,
      post: req.params.postId,
      user: req.currentUser.id,
    });

    await comment.save();

    // Return the created comment with user data populated for immediate display
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "-email -password")
      .exec();

    res.status(200).json({
      message: "تم إضافة التعليق",
      comment: populatedComment,
    });
  } catch (e) {
    console.error("Error creating comment:", e);
    res.status(500).json({ error: e.message });
  }
};

const getComment = async (req, res) => {
  // Validate postId is a valid ObjectId
  if (
    !req.params.postId ||
    !mongoose.Types.ObjectId.isValid(req.params.postId)
  ) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "-email -password")
      .sort({ createdAt: -1 }) // Show newest comments first
      .exec();
    res.status(200).json(comments);
  } catch (e) {
    console.error("Error fetching comments:", e);
    res.status(500).json({ error: e.message });
  }
};

export default { createComment, getComment }; // Default export as an object
