import mongoose from "mongoose";
// ...existing imports...

// Debug environment variables
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
console.log("MONGODB_URL loaded:", process.env.MONGODB_URL ? "Yes" : "No");

// ...rest of your code...
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    img_uri: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Define relationships
userSchema.virtual("posts", {
  ref: "Post", // Reference to the Post model
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("comments", {
  ref: "Comment", // Reference to the Comment model
  localField: "_id",
  foreignField: "user",
});

const User = mongoose.model("User", userSchema);

export default User;
