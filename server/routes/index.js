import express from "express";
import jwt from "jsonwebtoken"; // Add this import
import * as userController from "../controllers/userController.js";
import * as postController from "../controllers/postController.js"; // Modified import
import commentController from "../controllers/commentController.js";
import likeController from "../controllers/likeController.js";
import isLoggedIn, { optionalAuth } from "../middlewares/authentication.js";
import {
  userValidationRules,
  updateUserValidationRules,
  postValidationRules,
  validate,
} from "../middlewares/validator.js";
import { upload, storeMetadata } from "../middlewares/upload.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "أهلًا بالعالم!",
  });
});

// User Routes
router.post(
  "/account/register",
  userValidationRules(),
  validate,
  userController.register
);
// Add this test route
router.get("/test-auth", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    // Verify with just the JWT library
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: "Token verified",
      user: decoded,
    });
  } catch (err) {
    res.status(401).json({
      error: err.name,
      message: err.message,
    });
  }
});
router.post("/account/login", userController.login);
router.get("/account/profile", isLoggedIn, userController.getProfile);
router.put(
  "/account/profile/upload-photo",
  upload.single("avatar"), // Specify field name here
  storeMetadata, // Add metadata handling
  isLoggedIn,
  userController.uploadUserPhoto
);
router.put(
  "/account/profile/update",
  updateUserValidationRules(),
  validate,
  isLoggedIn,
  userController.updateProfile
);

// Post Routes
router.post(
  "/posts/create",
  upload.array("postImg", 5), // Handle multiple files
  postValidationRules(),
  validate,
  isLoggedIn,
  storeMetadata, // Optional: Add if metadata is needed for posts
  postController.newPost
);

// Routes accessible by both guests and authenticated users
router.get("/posts", optionalAuth, postController.getAllPosts);
router.get(
  "/posts/:postId",
  optionalAuth,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  postController.getPost
);

// Routes that require authentication
router.get("/my-posts", isLoggedIn, postController.getMyAllPosts);
router.get(
  "/my-posts/:postId",
  isLoggedIn,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  postController.getMyPost
);
router.put(
  "/my-posts/:postId/update",
  postValidationRules(),
  validate,
  isLoggedIn,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  postController.updateMyPost
);

router.delete("/my-posts/delete", isLoggedIn, (req, res) => {
  // Set the params.postId from the body
  const { postId } = req.body;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid post ID format" });
  }

  req.params.postId = postId;
  postController.deleteMyPost(req, res);
});
// Comment Routes
router.post(
  "/posts/:postId/create-comment",
  isLoggedIn,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  commentController.createComment
);
router.get(
  "/posts/:postId/get-comments",
  optionalAuth,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  commentController.getComment
);

// Like Routes
router.put(
  "/posts/:postId/like",
  isLoggedIn,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  likeController.like
);
router.get(
  "/posts/:postId/like-count",
  optionalAuth,
  (req, res, next) => {
    // Validate postId parameter
    const { postId } = req.params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    next();
  },
  likeController.likeCount
);

export default router;
