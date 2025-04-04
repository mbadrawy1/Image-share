/**
 * Utility functions for post operations
 */

/**
 * Checks if a given string is a valid MongoDB ObjectId
 * A valid ObjectId is a 24-character hex string
 * 
 * @param {string} id - The string to check
 * @returns {boolean} True if the string is a valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Extracts a MongoDB ObjectId from a URL path
 * Handles various URL patterns by searching for a valid ObjectId format
 * 
 * @returns {string|null} The post ID if found, otherwise null
 */
export const extractPostIdFromUrl = () => {
  const path = window.location.pathname;
  const fullUrl = window.location.href;
  console.log("Extracting post ID from:", {
    fullUrl,
    path,
    search: window.location.search
  });
  
  // Try different extraction methods and log results
  
  // Method 1: Check for standard route patterns
  let id = null;
  const routeMatch = /\/(posts|my-posts)\/([^\/]+)/.exec(path);
  if (routeMatch && routeMatch[2]) {
    id = routeMatch[2];
    console.log("Method 1 - Route pattern match:", id);
    if (isValidObjectId(id)) {
      console.log("✓ Valid ObjectId from route pattern");
      return id;
    } else {
      console.warn("✗ Invalid ObjectId from route pattern:", id);
    }
  }
  
  // Method 2: Check for any MongoDB ObjectId pattern in the path
  const objectIdMatch = path.match(/([0-9a-f]{24})/i);
  if (objectIdMatch) {
    id = objectIdMatch[0];
    console.log("Method 2 - ObjectId pattern in path:", id);
    if (isValidObjectId(id)) {
      console.log("✓ Valid ObjectId from path pattern");
      return id;
    }
  }
  
  // Method 3: Check query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const possibleParams = ['id', 'postId', 'post', 'postID', 'post_id'];
  
  for (const param of possibleParams) {
    const queryId = urlParams.get(param);
    if (queryId) {
      console.log(`Method 3 - Query parameter ${param}:`, queryId);
      if (isValidObjectId(queryId)) {
        console.log(`✓ Valid ObjectId from query parameter ${param}`);
        return queryId;
      } else {
        console.warn(`✗ Invalid ObjectId from query parameter ${param}:`, queryId);
      }
    }
  }
  
  // Method 4: Check for any ObjectId in the entire URL as last resort
  const fullUrlMatch = fullUrl.match(/([0-9a-f]{24})/i);
  if (fullUrlMatch) {
    id = fullUrlMatch[0];
    console.log("Method 4 - ObjectId pattern in full URL:", id);
    if (isValidObjectId(id)) {
      console.log("✓ Valid ObjectId from full URL");
      return id;
    }
  }
  
  console.error("✗ Could not extract a valid post ID from URL");
  return null;
}; 