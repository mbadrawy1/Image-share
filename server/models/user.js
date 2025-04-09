import mongoose from "mongoose";
// ...الاستيرادات الموجودة...

// تصحيح متغيرات البيئة
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No");
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
console.log("MONGODB_URL loaded:", process.env.MONGODB_URL ? "Yes" : "No");

// ...باقي الكود الخاص بك...
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
    timestamps: true, // يضيف تلقائيًا حقول createdAt و updatedAt
  }
);

// تعريف العلاقات
userSchema.virtual("posts", {
  ref: "Post", // إشارة إلى نموذج المنشور
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("comments", {
  ref: "Comment", // إشارة إلى نموذج التعليق
  localField: "_id",
  foreignField: "user",
});

const User = mongoose.model("User", userSchema);

export default User;
