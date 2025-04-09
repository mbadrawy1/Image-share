import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    contents: {
      type: String,
      description: "Main content/description text for the post",
    },
    steps: {
      type: String,
      description: "Additional formatted details, stored as JSON string",
    },
    country: {
      type: String,
    },
    region: {
      type: String,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostImage", // إشارة إلى نموذج صورة المنشور
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // إشارة إلى نموذج المستخدم
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like", // إشارة إلى نموذج الإعجاب
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // إشارة إلى نموذج التعليق
      },
    ],
  },
  {
    timestamps: true, // يضيف تلقائيًا حقول createdAt و updatedAt
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
