import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"; // Add this import
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "هذا البريد الإلكتروني مستخدم مسبقًا" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "تم إنشاء حسابك بنجاح" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const login = async (req, res) => {
  console.log("Login attempt with:", req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({ message: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" });
  }
  
  try {
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("No user found with email:", email);
      return res
        .status(401)
        .json({ message: "كلمة المرور أو البريد الإلكتروني غير صحيح" });
    }

    console.log("Comparing passwords for user:", email);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch ? "Yes" : "No");
    
    if (!isMatch) {
      console.log("Password doesn't match for user:", email);
      return res
        .status(401)
        .json({ message: "كلمة المرور أو البريد الإلكتروني غير صحيح" });
    }

    console.log("Generating token for user:", email);
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Token generated successfully");

    try {
      const client = await mongoose.connection.getClient();
      const result = await client.db().collection("tokens").insertOne({
        token,
        userId: user._id,
        createdAt: new Date(),
      });

      console.log("Token stored in database, ID:", result.insertedId);

      res.status(200).json({ accessToken: token });
    } catch (dbError) {
      console.error("Error storing token in database:", dbError);
      return res.status(500).json({ message: "خطأ في تخزين بيانات الدخول" });
    }
  } catch (e) {
    console.error("Login error:", e.message);
    res.status(500).json({ error: e.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    console.log("Current user in request:", req.currentUser);

    const user = await User.findById(req.currentUser.id).select("-password");
    console.log("Found user:", user);

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.status(200).json(user);
  } catch (e) {
    console.error("Profile error:", e);

    res.status(500).json({ error: e.message });
  }
};

export const uploadUserPhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.currentUser.id,
      { img_uri: "/images/" + req.file.filename },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.status(200).json({
      message: "تم إضافة الصورة بنجاح",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, password } = req.body;
  try {
    const updateFields = { name };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.currentUser.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.status(200).json({
      message: "تم تعديل البيانات الشخصية",
      user,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
