import mongoose from "mongoose";
import Like from "../models/like.js";

const like = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.currentUser.id;
    console.log(`Adding/removing like - postId: ${postId}, userId: ${userId}`);

    // Convert postId to ObjectId
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const userLiked = await Like.findOne({
      user: userObjectId,
      post: postObjectId,
    });
    console.log("User already liked:", !!userLiked);

    if (userLiked) {
      await Like.deleteOne({ user: userObjectId, post: postObjectId });
      res.status(200).json({ message: "تم حذف الإعجاب" });
    } else {
      const like = new Like({
        user: userObjectId,
        post: postObjectId,
      });
      const savedLike = await like.save();
      console.log("Saved like:", savedLike);
      res.status(200).json({ message: "تم إضافة الإعجاب", like: savedLike });
    }
  } catch (e) {
    console.error("Error in like function:", e);
    res.status(500).json({ error: e.message });
  }
};

const likeCount = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log(`Counting likes - postId: ${postId}`);

    // Check if user is guest or authenticated
    const isGuest = req.isGuest === true;
    console.log(`Request from ${isGuest ? "guest" : "authenticated"} user`);

    // Convert postId to ObjectId
    const postObjectId = new mongoose.Types.ObjectId(postId);

    // Count total likes for the post
    const likes = await Like.countDocuments({ post: postObjectId });
    console.log(`Found ${likes} likes for post ${postId}`);

    let userLiked = false;

    // Only check if user liked the post if they're authenticated
    if (!isGuest && req.currentUser && req.currentUser.id) {
      const userObjectId = new mongoose.Types.ObjectId(req.currentUser.id);
      const userLikedDoc = await Like.findOne({
        user: userObjectId,
        post: postObjectId,
      });
      userLiked = !!userLikedDoc;
      console.log(`User ${req.currentUser.id} liked this post: ${userLiked}`);
    }

    res.status(200).json({ likes, userLiked });
  } catch (e) {
    console.error("Error in likeCount function:", e);
    res.status(500).json({ error: e.message });
  }
};

export default { like, likeCount };
