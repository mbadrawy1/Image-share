import mongoose from "mongoose";

const { Schema } = mongoose;

const postImageSchema = new Schema(
  {
    img_uri: {
      type: String,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Reference to the Post model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const PostImage = mongoose.model("PostImage", postImageSchema);

export default PostImage;
