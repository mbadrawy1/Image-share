import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

let mongoClient = null;
let db = null;

// Initialize MongoDB connection
const initializeDB = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URL);
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("MongoDB connection initialized");
  }
  return db;
};

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "لم يتم توفير رمز الدخول" });
    }

    // Extract token properly
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "رمز الدخول غير صالح" });
    }

    console.log("Token being verified:", token.substring(0, 20) + "...");

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully, payload:", decoded);

      // Get database instance
      const db = await initializeDB();

      // Log the token we're searching for
      console.log("Searching for token in database...");

      const tokenExists = await db.collection("tokens").findOne({ token });

      console.log("Token found in database:", !!tokenExists);

      if (!tokenExists) {
        return res.status(401).json({ message: "رمز الدخول غير صالح" });
      }

      // Store decoded user info in request object
      req.currentUser = { id: decoded.id, email: decoded.email };
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError.message);
      return res.status(401).json({ message: "رمز الدخول منتهي أو غير صالح" });
    }
  } catch (e) {
    console.error("Auth error:", e.message);
    res.status(500).json({ error: e.message });
  }
};

// Middleware that allows both authenticated and guest users
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no auth header, continue as guest
    if (!authHeader) {
      console.log("No auth token provided, continuing as guest");
      req.isGuest = true;
      return next();
    }

    // Try to extract and validate token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token || token === "null" || token === "undefined") {
      console.log("Invalid token format, continuing as guest");
      req.isGuest = true;
      return next();
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully, payload:", decoded);

      // Get database instance
      const db = await initializeDB();
      const tokenExists = await db.collection("tokens").findOne({ token });

      if (!tokenExists) {
        console.log("Token not found in database, continuing as guest");
        req.isGuest = true;
        return next();
      }

      // Set authenticated user info
      req.currentUser = { id: decoded.id, email: decoded.email };
      req.isGuest = false;
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError.message);
      req.isGuest = true;
      next();
    }
  } catch (e) {
    console.error("Auth error in optionalAuth:", e.message);
    req.isGuest = true;
    next();
  }
};

// Cleanup function to be called when server shuts down
const cleanup = async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB connection closed");
  }
};

export { cleanup };
export default isLoggedIn;
export { optionalAuth };
