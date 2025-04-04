import Post from "../models/post.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import fs from "fs/promises";
import PostImage from "../models/post_image.js";
// Make sure to import this

export const newPost = async (req, res) => {
  const { title, contents, steps, country, region } = req.body;
  try {
    // Ensure data is properly formatted for new UI that combines contents and steps
    // But maintain backward compatibility with existing structure

    // 1. Create the Post document first (without images)
    const post = new Post({
      title,
      contents, // Main description text
      steps, // Additional formatted details stored as JSON string
      country,
      region,
      user: req.currentUser.id,
      images: [], // Start with empty images array
    });

    await post.save();

    // 2. Create PostImage documents for each uploaded file
    const imagePromises = req.files.map(async (file) => {
      const imagePath = "/images/" + file.filename; // Remove 'public' from path

      // Create and save PostImage document
      const postImage = new PostImage({
        img_uri: imagePath,
        post: post._id,
      });

      await postImage.save();

      // Return the saved image's ID
      return postImage._id;
    });

    // 3. Wait for all PostImage documents to be created
    const imageIds = await Promise.all(imagePromises);

    // 4. Update the Post with the image references
    post.images = imageIds;
    await post.save();

    // 5. Update user's posts array
    await User.findByIdAndUpdate(req.currentUser.id, {
      $push: { posts: post._id },
    });

    res.status(200).json({
      message: "تم إضافة منشور جديد",
      post: post,
    });
  } catch (e) {
    console.error("Post creation error:", e);
    res.status(500).json({ error: e.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "user",
        select: "-password -email",
      })
      .sort({ createdAt: -1 });

    // If we have a logged in user, check which posts they've liked
    if (req.currentUser && !req.isGuest) {
      // For authenticated users, we could add info about which posts they've liked
      // But this is optional and can be handled on the client side as well
      console.log("Logged in user viewing all posts:", req.currentUser.email);
    } else {
      console.log("Guest user viewing all posts");
    }

    res.status(200).json(posts);
  } catch (e) {
    console.error("Error in getAllPosts:", e);
    res.status(500).json({ error: e.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate({
        path: "user",
        select: "-password -email",
      })
      .populate("images")
      .lean();

    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    // Transform the data to match frontend expectations
    const transformedPost = {
      ...post,
      User: post.user,
      user: post.user,
      Post_Images: post.images.map((img) => ({
        id: img._id,
        img_uri: img.img_uri,
      })),
    };

    // Log whether this is a guest or authenticated user
    if (req.currentUser && !req.isGuest) {
      console.log("Logged in user viewing post:", req.currentUser.email);
    } else {
      console.log("Guest user viewing post");
    }

    res.status(200).json(transformedPost);
  } catch (e) {
    console.error("Error in getPost:", e);
    res.status(500).json({ error: e.message });
  }
};

export const getMyAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.currentUser.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getMyPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      user: req.currentUser.id,
    });

    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    res.status(200).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateMyPost = async (req, res) => {
  const { title, contents, steps } = req.body;
  try {
    // Construct update object with the fields from the request
    const updateData = {
      title,
      contents, // Main description text
      steps, // Additional formatted details stored as JSON string
    };

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.postId,
        user: req.currentUser.id,
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    res.status(200).json({
      message: "تم التعديل على بيانات المنشور",
      post,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteMyPost = async (req, res) => {
  console.log("Deleting post with params:", req.params);
  console.log("Current user:", req.currentUser);

  try {
    if (!req.params.postId) {
      console.log("No postId provided");
      return res.status(400).json({ error: "معرف المنشور غير صالح" });
    }

    console.log("Looking for post with ID:", req.params.postId);
    const post = await Post.findOne({
      _id: req.params.postId,
      user: req.currentUser.id,
    });

    console.log("Post found:", post ? "Yes" : "No");
    if (!post) return res.status(404).json({ message: "المنشور غير موجود" });

    console.log("Deleting images for post:", post._id);
    // First get all image documents to access their paths
    const postImages = await PostImage.find({ _id: { $in: post.images } });
    console.log("Found images:", postImages.length);

    // Delete the actual image files
    await Promise.all(
      postImages.map(async (postImage) => {
        try {
          await fs.unlink("." + postImage.img_uri);
        } catch (fileError) {
          console.log(
            `Failed to delete file: ${postImage.img_uri}`,
            fileError.message
          );
          // Continue with deletion even if file is missing
        }
      })
    );

    // Delete the PostImage documents
    await PostImage.deleteMany({ _id: { $in: post.images } });

    // Now delete the post itself
    await Post.findOneAndDelete({
      _id: req.params.postId,
      user: req.currentUser.id,
    });

    // Delete related comments and likes
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });

    // Remove from user's posts array
    await User.findByIdAndUpdate(req.currentUser.id, {
      $pull: { posts: post._id },
    });

    res.status(200).json({ message: "تم حذف منشورك" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
