import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true, // Add index for performance on post-based queries
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to objects
  }
);

// Add a post-save middleware if needed
commentSchema.post("save", function (doc, next) {
  console.log("New comment saved:", doc._id);
  next();
});

// Pre-find middleware to populate user data
commentSchema.pre("find", function () {
  this.populate("user", "-password -email");
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
