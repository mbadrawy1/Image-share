import multer from "multer";
import { MongoClient } from "mongodb";
import path from "path";
import fs from "fs";

const DIR = "./public/images";

// MongoDB client setup
let mongoClient = null;
let db = null;

// Initialize MongoDB connection
const initializeDB = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URL);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("MongoDB connection initialized for upload middleware");
  }
  return db;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR, { recursive: true });
    }
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const extArray = file.mimetype.split("/");
    const extension = extArray[extArray.length - 1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}.${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Export the configured multer instance
export const upload = multer({ storage, fileFilter });

// Middleware to handle MongoDB metadata storage
export const storeMetadata = async (req, res, next) => {
  // Handle both single file and multiple files
  if (!req.file && (!req.files || req.files.length === 0)) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    const db = await initializeDB();

    // Convert single file to array format for consistent handling
    const filesToProcess = req.file ? [req.file] : req.files;

    // Store metadata for each uploaded file
    const fileMetadataArray = filesToProcess.map((file) => ({
      filename: file.filename,
      path: path.join(DIR, file.filename),
      mimetype: file.mimetype,
      size: file.size,
      uploadTime: new Date(),
    }));

    await db.collection("uploads").insertMany(fileMetadataArray);

    req.fileMetadata = fileMetadataArray; // Pass metadata to the next middleware
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cleanup function to be called when server shuts down
export const cleanup = async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("Upload middleware MongoDB connection closed");
  }
};
