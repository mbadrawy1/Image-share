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
      ref: "Post", // إشارة إلى نموذج المنشور
      required: true,
    },
  },
  {
    timestamps: true, // يضيف تلقائيًا حقول createdAt و updatedAt
  }
);

const PostImage = mongoose.model("PostImage", postImageSchema);

export default PostImage;
