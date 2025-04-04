import React, { useState, useContext } from "react";
import ImageModal from "../UI/ImageModal";
import "../UI/ImageModal.css";
import Like from "../Like/Like";
import CreateComment from "../Comment/CreateComment";
import { AuthContext } from "../../context/AuthContext";
import { getImageUrl, generateImageUrlCandidates, NO_IMAGE_SVG } from "../../utils/imageUtils";
import "./PostCard.css";

const PostCard = ({ post, imageUrl, onOptionsClick, onClick, promptLogin }) => {
  const isDesktop = window.innerWidth >= 768;
  const [showModal, setShowModal] = useState(false);
  const { jwt } = useContext(AuthContext);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  // Get image from post if imageUrl wasn't provided
  const getPostImage = () => {
    // If imageUrl was provided, use it
    if (imageUrl) return imageUrl;
    
    // Otherwise try to extract from post
    if (post && post.Post_Images && post.Post_Images.length > 0) {
      return getImageUrl(post.Post_Images[0]);
    }
    
    // Or try the images array
    if (post && post.images && post.images.length > 0) {
      return getImageUrl(post.images[0]); 
    }
    
    // Last resort
    return NO_IMAGE_SVG;
  };
  
  // Handle image load error by trying next URL
  const handleImageError = (e) => {
    console.log("Image load failed:", e.target.src);
    
    // Generate all possible URLs
    let urlCandidates = [];
    
    if (post && post.Post_Images && post.Post_Images.length > 0) {
      urlCandidates = generateImageUrlCandidates(post.Post_Images[0]);
    } else if (post && post.images && post.images.length > 0) {
      urlCandidates = generateImageUrlCandidates(post.images[0]);
    }
    
    // Find current URL index
    const currentIndex = urlCandidates.indexOf(e.target.src);
    
    // Try next URL if available
    if (currentIndex >= 0 && currentIndex < urlCandidates.length - 1) {
      const nextUrl = urlCandidates[currentIndex + 1];
      console.log("Trying next URL:", nextUrl);
      setCurrentImageUrl(nextUrl);
    } else {
      // Use placeholder as last resort
      console.log("Using placeholder image");
      setCurrentImageUrl(NO_IMAGE_SVG);
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCardClick = () => {
    if (onClick) onClick();
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (!jwt && promptLogin) {
      promptLogin();
    }
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Options icon clicked");
    if (onOptionsClick) {
      onOptionsClick(e);
    }
  };

  // Use state or fallback to props
  const displayImageUrl = currentImageUrl || getPostImage();

  return (
    <div className={isDesktop ? "post-column-md" : "post-column"}>
      <div className="post-card" onClick={handleCardClick}>
        <div className="post-card-image-container clickable-image-container">
          <img
            src={displayImageUrl}
            alt={post.title}
            className="post-card-image"
            onClick={handleImageClick}
            onError={handleImageError}
          />
        </div>
        <div className="post-card-content">
          <div className="post-card-header">
            <h3 className="post-title">{post.title}</h3>
            <div
              className="post-icon"
              onClick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 512 512"
              >
                <circle
                  cx="256"
                  cy="256"
                  r="32"
                  fill="currentColor"
                />
                <circle
                  cx="256"
                  cy="416"
                  r="32"
                  fill="currentColor"
                />
                <circle
                  cx="256"
                  cy="96"
                  r="32"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div className="post-description">
            <h4 className="description-label">الوصف</h4>
            <p className="post-contents">{post.contents}</p>
          </div>
          
          <div className="post-actions">
            {post._id ? (
              <>
                {jwt ? (
                  <>
                    <Like postId={post._id} sendToParent={() => {}} />
                    <CreateComment postId={post._id} sendToParent={() => {}} />
                  </>
                ) : (
                  <>
                    <div 
                      onClick={handleActionClick}
                      className="post-action-button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 512 512"
                        fill="#cccccc"
                      >
                        <path d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0018 0c96.26-65.34 184.09-143.09 183-252.42-.54-52.67-42.32-96.81-95.08-96.81z" />
                      </svg>
                      <span className="post-action-text">Login to like</span>
                    </div>
                    <div 
                      onClick={handleActionClick}
                      className="post-action-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="#cccccc">
                        <path d="M87.49 380c1.19-4.38-1.44-10.47-3.95-14.86a44.86 44.86 0 00-2.54-3.8 199.81 199.81 0 01-33-110C47.65 139.09 140.73 48 255.83 48 356.21 48 440 117.54 459.58 209.85a199 199 0 014.42 41.64c0 112.41-89.49 204.93-204.59 204.93-18.3 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.09 31.09 0 00-11.12-2.07 30.71 30.71 0 00-12.09 2.43l-67.83 24.48a16 16 0 01-4.67 1.22a9.6 9.6 0 01-9.57-9.74 15.85 15.85 0 01.6-3.29z" />
                      </svg>
                      <span className="post-action-text">Login to comment</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>Post ID is missing</div>
            )}
          </div>
        </div>
      </div>
      
      <ImageModal 
        isOpen={showModal} 
        imageUrl={displayImageUrl} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default PostCard; 