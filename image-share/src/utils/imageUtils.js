import { API_URL, IMAGE_BASE_URL } from "../config/urls";

// Placeholder SVG for missing images
export const NO_IMAGE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Resolves a relative path with the API URL
 * @param {string} path - Relative path starting with '/'
 * @returns {string} - Full URL
 */
export const resolveRelativePath = (path) => {
  if (!path) return null;
  
  // If the path already has the API_URL, return it as is
  if (path.startsWith('http')) return path;
  
  // Make sure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove the API_URL base if it's already in the path
  const apiUrlBase = new URL(API_URL).pathname;
  const cleanPath = normalizedPath.startsWith(apiUrlBase) 
    ? normalizedPath.substring(apiUrlBase.length) 
    : normalizedPath;
    
  return `${API_URL}${cleanPath}`;
};

/**
 * Extracts a filename from various image object formats
 * @param {Object|string} img - Image object or string
 * @returns {string|null} - Extracted filename or null
 */
export const extractImageFilename = (img) => {
  if (!img) return null;

  // Handle string case
  if (typeof img === "string") {
    // Remove any leading path
    return img.split("/").pop();
  }

  // Handle object case
  const possibleProperties = [
    "filename",
    "img_uri",
    "imageUrl",
    "uri",
    "path",
    "name",
  ];

  for (const prop of possibleProperties) {
    if (img[prop]) {
      const value = img[prop];
      if (typeof value === "string") {
        return value.split("/").pop();
      }
    }
  }

  // Use ID as last resort
  if (img._id) return img._id;
  if (img.id) return img.id;

  return null;
};

/**
 * Generates an array of potential image URLs to try
 * @param {Object|string} img - Image object or string
 * @returns {Array} - Array of URLs to try in order
 */
export const generateImageUrlCandidates = (img) => {
  if (!img) return [NO_IMAGE_SVG];

  // For direct strings, try to resolve them
  if (typeof img === "string") {
    return [
      resolveRelativePath(img),
      `${API_URL}${img}`,
      `${IMAGE_BASE_URL}/${img.split("/").pop()}`,
      NO_IMAGE_SVG
    ].filter(Boolean);
  }

  const filename = extractImageFilename(img);
  
  // Important: Use img_uri directly if available - this is how the server stores paths
  if (img.img_uri) {
    return [
      // Try direct img_uri first - this is most likely to work
      resolveRelativePath(img.img_uri),
      `${API_URL}${img.img_uri}`,
      // Then fallback to constructed paths
      `${API_URL}/images/${filename}`,
      `${API_URL}/uploads/${filename}`,
      `${IMAGE_BASE_URL}/${filename}`,
      NO_IMAGE_SVG
    ].filter(Boolean);
  }
  
  if (!filename) return [NO_IMAGE_SVG];
  
  console.log(`Generating URL candidates for filename: ${filename}`);
  
  // Generate multiple possible URLs to try
  const candidates = [
    // Direct URLs if present in object
    img.imageUrl,
    img.uri,
    img.url,
    
    // API_URL variations
    `${API_URL}/images/${filename}`,
    `${API_URL}/uploads/${filename}`,
    
    // IMAGE_BASE_URL variations
    `${IMAGE_BASE_URL}/${filename}`,
    
    // Relative paths
    `/images/${filename}`,
    `/uploads/${filename}`,
    
    // Last resort
    NO_IMAGE_SVG
  ];
  
  // Filter out undefined/null entries and return
  return candidates.filter(Boolean);
};

/**
 * Gets the most likely image URL with console debugging
 * @param {Object|string} img - Image object or string
 * @returns {string} - Best URL to try first
 */
export const getImageUrl = (img) => {
  const candidates = generateImageUrlCandidates(img);
  console.log("URL candidates:", candidates);
  return candidates[0] || NO_IMAGE_SVG;
};

/**
 * Creates an image with fallback URLs
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Image element with error handling
 */
export const createImageWithFallbacks = (props) => {
  const { img, alt = "Image", className, style, onClick, onLoad } = props;

  // Get all possible URLs to try
  const urlCandidates = generateImageUrlCandidates(img);

  // Handle error by trying next URL
  const handleError = (e) => {
    const currentSrc = e.target.src;
    const currentIndex = urlCandidates.indexOf(currentSrc);

    // If we have more URLs to try
    if (currentIndex >= 0 && currentIndex < urlCandidates.length - 1) {
      const nextSrc = urlCandidates[currentIndex + 1];
      console.log(
        `Image load failed for ${currentSrc}, trying next: ${nextSrc}`
      );
      e.target.src = nextSrc;
    } else {
      // Use placeholder as last resort
      console.log(`All image URLs failed, using placeholder`);
      e.target.src = NO_IMAGE_SVG;
      e.target.onerror = null; // Prevent further errors
    }
  };

  return {
    src: urlCandidates[0] || NO_IMAGE_SVG,
    alt,
    className,
    style,
    onClick,
    onLoad,
    onError: handleError,
  };
};
