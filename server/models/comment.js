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
      index: true, // إضافة فهرس لتحسين الأداء في الاستعلامات المستندة إلى المنشور
    },
  },
  {
    timestamps: true, // يضيف تلقائيًا حقول createdAt و updatedAt
    toJSON: { virtuals: true }, // تضمين الحقول الافتراضية عند التحويل إلى JSON
    toObject: { virtuals: true }, // تضمين الحقول الافتراضية عند التحويل إلى كائنات
  }
);

// إضافة معالج بعد الحفظ إذا لزم الأمر
commentSchema.post("save", function (doc, next) {
  console.log("New comment saved:", doc._id);
  next();
});

// معالج ما قبل البحث لملء بيانات المستخدم
commentSchema.pre("find", function () {
  this.populate("user", "-password -email");
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
