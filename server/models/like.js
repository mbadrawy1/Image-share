import mongoose from "mongoose";

const { Schema } = mongoose;

// تعريف هيكل الإعجاب الصحيح
const likeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // يرتبط بنموذج المستخدم
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post", // يرتبط بنموذج المنشور
      required: true,
    },
  },
  { timestamps: false } // إلغاء الطابع الزمني إذا لزم الأمر
);

// إنشاء نموذج الإعجاب
const Like = mongoose.model("Like", likeSchema);

export default Like;
