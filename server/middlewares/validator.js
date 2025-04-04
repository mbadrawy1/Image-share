import { body, validationResult } from "express-validator";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URL);

const userValidationRules = () => {
  return [
    body("name").notEmpty().withMessage("اسم المستخدم مطلوب"),
    body("email")
      .notEmpty()
      .withMessage("البريد الإلكتروني مطلوب")
      .isEmail()
      .withMessage("البريد الإلكتروني غير صالح")
      .custom(async (email) => {
        // Check if the email already exists in the database
        await mongoClient.connect();
        const db = mongoClient.db();
        const user = await db.collection("users").findOne({ email });
        await mongoClient.close();
        if (user) {
          throw new Error("البريد الإلكتروني مستخدم بالفعل");
        }
      }),
    body("password")
      .notEmpty()
      .withMessage("كلمة المرور مطلوبة")
      .isLength({ min: 5 })
      .withMessage("كلمة المرور يجب أن تكون أكثر من خمسة محارف"),
  ];
};

const updateUserValidationRules = () => {
  return [
    body("name").notEmpty().withMessage("اسم المستخدم مطلوب"),
    body("password")
      .notEmpty()
      .withMessage("كلمة المرور مطلوبة")
      .isLength({ min: 5 })
      .withMessage("كلمة المرور يجب أن تكون أكثر من خمسة محارف"),
  ];
};

const postValidationRules = () => {
  return [
    body("title").notEmpty().withMessage("عنوان المنشور مطلوب"),
    body("contents").notEmpty().withMessage("وصف المنشور مطلوب"),
    // Steps is optional as it contains additional formatted details
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({ errors: errors.array() });
};

export {
  userValidationRules,
  updateUserValidationRules,
  postValidationRules,
  validate,
};
