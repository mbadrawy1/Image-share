import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { Editor, EditorState, convertFromRaw } from "draft-js";
import axios from "../config/axios";
import moment from "moment";
import "moment/locale/ar";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import avatar from "./assets/images/avatar.png";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header/Header";
import Like from "../components/Like/Like";
import GetComment from "../components/Comment/GetComment";
import CreateComment from "../components/Comment/CreateComment";
import { GET_ALL_POSTS, API_URL, IMAGE_BASE_URL } from "../config/urls";
import { extractPostIdFromUrl, isValidObjectId } from "../utils/postUtils";
import { getImageUrl, generateImageUrlCandidates, NO_IMAGE_SVG } from "../utils/imageUtils";
import ActionSheet from "../components/UI/ActionSheet";
import ImageModal from "../components/UI/ImageModal";
import "../components/UI/ImageModal.css";
import { useNavigate } from "react-router-dom";
import Loading from "../components/UI/Loading";
import Alert from "../components/UI/Alert";
import ImageDiagnostic from "../components/UI/ImageDiagnostic";

moment.locale("ar");

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "0 16px",
    width: "100%",
    boxSizing: "border-box",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  row: {
    display: "flex",
    width: "100%",
    maxWidth: "1200px",
    justifyContent: "center",
  },
  column: {
    width: "100%",
    maxWidth: "768px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  userTextCol: {
    marginLeft: "12px",
  },
  locationCol: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
  listHeader: {
    color: "#3880ff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  itemDivider: {
    backgroundColor: "#f5f5f5",
    padding: "8px 0",
    marginTop: "16px",
    marginBottom: "16px",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 2s linear infinite",
  },
  postUsername: {
    margin: "0",
    fontWeight: "bold",
    fontSize: "16px",
  },
  postTime: {
    margin: "0",
    color: "#f7b500",
    fontSize: "12px",
  },
  postImageContainer: {
    width: "100%",
    height: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "16px",
    cursor: "pointer",
    position: "relative",
    transition: "box-shadow 0.3s ease",
  },
  postImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
};

const GetPost = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [post, setPost] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState(null);
  const [commentUpdated, setCommentUpdated] = useState(false);
  const [steps, setSteps] = useState(null);
  const [error, setError] = useState(null);
  const [postId, setPostId] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { jwt, guestMode } = useContext(AuthContext);
  const contentRef = React.useRef(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("GetPost component mounted");
    console.log("Current URL:", window.location.href);
    console.log("Path:", window.location.pathname);
    
    // Try to get post ID from URL first
    const id = extractPostIdFromUrl();
    console.log("ID from URL extraction:", id);
    
    // Check localStorage as a fallback
    const storedId = localStorage.getItem("lastCreatedPostId");
    console.log("ID from localStorage:", storedId);
    
    let finalId = id;
    
    // If no ID from URL but we have one in localStorage, use that
    if (!id && storedId) {
      console.log("Using ID from localStorage instead of URL");
      finalId = storedId;
      // Clear localStorage to prevent using this ID again unintentionally
      localStorage.removeItem("lastCreatedPostId");
    }
    
    if (finalId && isValidObjectId(finalId)) {
      console.log("Valid post ID found:", finalId);
      setPostId(finalId);
      fetchPost(finalId);
    } else {
      console.error("No valid post ID found");
      setError("Invalid post ID. Please check the URL and try again.");
      setShowLoading(false);
    }
  }, []);

  // For debugging render issues, add console logs to detect what's rendering
  useEffect(() => {
    if (showLoading) {
      console.log("Loading state is active");
    } else if (error) {
      console.log("Error state is active:", error);
    } else if (post) {
      console.log("Post rendering with data:", {
        title: post.title,
        hasImages: !!(post.Post_Images && post.Post_Images.length),
        imageCount: post.Post_Images?.length || 0
      });
    } else {
      console.log("None of the rendering conditions are met - blank state");
    }
  }, [showLoading, error, post]);

  useEffect(() => {
    if (post) {
      // Print complete post structure to understand the data
      console.log("Complete post data structure:", JSON.stringify(post, null, 2));
      
      // Print image-related info specifically
      if (post.Post_Images && post.Post_Images.length > 0) {
        console.log("Post image details:");
        post.Post_Images.forEach((img, index) => {
          // Extract all properties for debugging
          const imgProps = Object.keys(img).reduce((acc, key) => {
            acc[key] = img[key];
            return acc;
          }, {});
          console.log(`Image ${index}:`, imgProps);
          
          // Log all possible URLs we might try
          const possibleUrls = [
            // Try API_URL paths
            `${API_URL}/images/${img.filename || ''}`,
            `${API_URL}/uploads/${img.filename || ''}`,
            // Try IMAGE_BASE_URL paths
            `${IMAGE_BASE_URL}/${img.filename || ''}`,
            `${IMAGE_BASE_URL}/${img.img_uri || ''}`,
            // Try direct img_uri
            `${img.img_uri || ''}`,
          ].filter(Boolean);
          
          console.log(`Possible URLs for image ${index}:`, possibleUrls);
        });
      } else {
        console.log("Post has no images in Post_Images array");
      }
      
      // Check if images might be in a different property
      const otherImageProps = ['images', 'image', 'Photos', 'photo'];
      otherImageProps.forEach(prop => {
        if (post[prop]) {
          console.log(`Found images in post.${prop}:`, post[prop]);
        }
      });
    }
  }, [post]);

  const fetchPost = async (id) => {
    if (!id) return;
    
    setShowLoading(true);
    setError(null);
    console.log("Fetching post with ID:", id);
    try {
      let response;
      if (jwt) {
        // Authenticated request
        console.log("Making authenticated request with JWT:", jwt.substring(0, 15) + "...");
        response = await axios.get(`${GET_ALL_POSTS}/${id}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        // Guest request
        console.log("Making guest request without authentication");
        response = await axios.get(`${GET_ALL_POSTS}/${id}`);
      }
      
      console.log("Post data received:", response.data);
      console.log("Response status:", response.status);
      
      if (!response.data || !response.data._id) {
        console.error("Invalid post data received:", response.data);
        setError("Invalid post data received from server");
        setShowLoading(false);
        return;
      }
      
      setPost(response.data);
      
      // Try to parse steps if available
      if (response.data.steps) {
        try {
          console.log("Attempting to parse steps:", response.data.steps);
          
          // Handle both string JSON and already-parsed objects
          const stepsData = typeof response.data.steps === 'string' 
            ? JSON.parse(response.data.steps) 
            : response.data.steps;
          
          console.log("Steps data after parsing:", stepsData);
          
          // Create EditorState safely
          if (stepsData && stepsData.blocks) {
            try {
              const contentState = convertFromRaw(stepsData);
              const editorState = EditorState.createWithContent(contentState);
              setSteps(editorState);
              console.log("Successfully created EditorState");
            } catch (editorError) {
              console.error("Error creating EditorState:", editorError);
            }
          } else {
            console.warn("Steps data does not contain expected format with blocks:", stepsData);
          }
        } catch (parseError) {
          console.error("Error parsing steps:", parseError);
        }
      }
    } catch (e) {
      console.error("Error fetching post:", e);
      if (e.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server response error:", e.response.status, e.response.data);
        if (e.response.status === 404) {
          setError("The post you are looking for could not be found.");
        } else {
          setError(`Error: ${e.response.data.message || "Failed to load post"}`);
        }
      } else if (e.request) {
        // The request was made but no response was received
        console.error("No response received:", e.request);
        setError("Could not connect to the server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", e.message);
        setError(`Error: ${e.message}`);
      }
    } finally {
      setShowLoading(false);
    }
  };

  const swiper_settings = {
    navigation: true,
    pagination: {
      clickable: true,
    },
  };

  const handleCommentSubmit = (comment) => {
    if (comment) {
      console.log("New comment received:", comment);
      setNewComment(comment);
      setCommentUpdated(!commentUpdated);
    }
  };

  const handleActionSheetOption = (option, post) => {
    switch (option) {
      case "view":
        // Already viewing, so no action needed
        break;
      case "share":
        // Implement share functionality if needed
        // Could use navigator.share if available
        if (navigator.share) {
          navigator.share({
            title: post.title,
            text: post.contents,
            url: window.location.href,
          }).catch(err => console.error('Could not share', err));
        }
        break;
      default:
        break;
    }
    setShowActionSheet(false);
  };

  const promptLogin = () => {
    setShowLoginPrompt(true);
    setTimeout(() => {
      setShowLoginPrompt(false);
    }, 3000);
  };

  const renderLoginPrompt = () => {
    if (!showLoginPrompt) return null;
    
    return (
      <div style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "10px 20px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        maxWidth: "400px"
      }}>
        <span>Please log in to like or comment</span>
        <button 
          onClick={() => navigate("/account/login")}
          style={{
            backgroundColor: "#eb9834",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px"
          }}
        >
          Login
        </button>
      </div>
    );
  };

  // Add a fallback UI for error states
  const renderErrorState = () => {
    if (!error) return null;
    
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        marginTop: "50px",
      }}>
        <h2 style={{ color: "#d32f2f" }}>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate("/posts")}
          style={{
            backgroundColor: "#eb9834",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Back to Posts
        </button>
      </div>
    );
  };

  const handleImageClick = (img) => {
    // Use our new utility to get the best image URL
    setSelectedImage(getImageUrl(img));
    setShowImageModal(true);
  };

  // New handler for when a successful URL is found
  const handleSuccessfulImageUrl = (url) => {
    console.log("Found working image URL:", url);
    // You can update state or take other actions when a working URL is found
  };

  return (
    <div style={styles.page}>
      <Loading show={showLoading} />
      {renderLoginPrompt()}
      
      <Header headerTitle="مشاهدة المنشور" defaultHref="/posts" />
      
      <div style={styles.content}>
        {error ? (
          renderErrorState()
        ) : !post || showLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading post...</p>
          </div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.row}>
              <div style={styles.column}>
                {/* Add toggle for diagnostics */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  marginBottom: "10px" 
                }}>
                  <button 
                    onClick={() => setShowDiagnostics(!showDiagnostics)}
                    style={{
                      background: "none",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {showDiagnostics ? "Hide Image Diagnostics" : "Show Image Diagnostics"}
                  </button>
                </div>
                
                {post && post.Post_Images && post.Post_Images.length > 0 ? (
                  <>
                    {/* Display diagnostics if enabled */}
                    {showDiagnostics && post.Post_Images.map((img, idx) => (
                      <ImageDiagnostic 
                        key={idx}
                        img={img} 
                        onUrlSuccess={handleSuccessfulImageUrl}
                      />
                    ))}
                    
                    <Swiper {...swiper_settings} modules={[Pagination, Navigation]}>
                      {post.Post_Images.map((img, index) => (
                        <SwiperSlide key={index}>
                          <div 
                            className="clickable-image-container"
                            style={styles.postImageContainer}
                            onClick={() => handleImageClick(img)}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt="Post image"
                              style={styles.postImage}
                              onError={(e) => {
                                console.log("Image load error, trying fallbacks");
                                
                                // Generate all possible URLs for this image
                                const urlCandidates = generateImageUrlCandidates(img);
                                
                                // Find current URL index
                                const currentIndex = urlCandidates.indexOf(e.target.src);
                                
                                // Try next URL if available
                                if (currentIndex >= 0 && currentIndex < urlCandidates.length - 1) {
                                  const nextUrl = urlCandidates[currentIndex + 1];
                                  console.log("Trying next URL:", nextUrl);
                                  e.target.src = nextUrl;
                                } else {
                                  // Use placeholder as last resort
                                  console.log("Using placeholder image");
                                  e.target.src = NO_IMAGE_SVG;
                                  e.target.onerror = null; // Prevent further errors
                                }
                              }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </>
                ) : (
                  <div style={{ ...styles.postImageContainer, justifyContent: "center", alignItems: "center" }}>
                    <img 
                      src={NO_IMAGE_SVG}
                      alt="No image available" 
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  </div>
                )}
                <div style={styles.card}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      <img
                        src={
                          post.user && post.user.img_uri
                            ? `${IMAGE_BASE_URL}/${post.user.img_uri.startsWith('/') ? post.user.img_uri.substring(1) : post.user.img_uri}`
                            : avatar
                        }
                        alt="User Avatar"
                        style={styles.avatarImg}
                        onError={(e) => {
                          e.target.src = avatar;
                        }}
                      />
                    </div>
                    <div style={styles.userTextCol}>
                      <h3 style={styles.postUsername}>
                        {(post.user && post.user.name) || (post.User && post.User.name) || "Anonymous"}
                      </h3>
                      <p style={styles.postTime}>
                        {moment(post.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <h2>{post.title}</h2>
                  <div style={{ display: "flex", marginBottom: "16px" }}>
                    {jwt && post && post._id ? (
                      <Like postId={post._id} showCount={true} />
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          promptLogin();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center", 
                          gap: "4px",
                          padding: "4px 8px",
                          cursor: "pointer"
                        }}
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
                        <span style={{ color: "#cccccc" }}>Login to like</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 style={styles.listHeader}>الوصف</h3>
                    <p>{post.contents || "No description available"}</p>
                  </div>
                </div>
                <div style={styles.itemDivider}>
                  <h3 style={{ ...styles.listHeader, margin: 0 }}>
                    التعليقات
                  </h3>
                </div>
                {postId ? (
                  <GetComment comment={commentUpdated} postId={postId} />
                ) : (
                  <div style={{ ...styles.card, textAlign: "center" }}>
                    <p>Cannot load comments: No valid post ID</p>
                  </div>
                )}
                <div style={styles.itemDivider}>
                  <h3
                    style={{
                      ...styles.listHeader,
                      margin: 0,
                      fontSize: "16px",
                    }}
                  >
                    اكتب تعليقًا
                  </h3>
                </div>
                {postId ? (
                  jwt ? (
                    <CreateComment sendToParent={handleCommentSubmit} postId={postId} />
                  ) : (
                    <div style={{ ...styles.card, textAlign: "center" }}>
                      <p>Please log in to add comments</p>
                      <button 
                        onClick={() => navigate("/account/login")}
                        style={{
                          backgroundColor: "#eb9834",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginTop: "10px"
                        }}
                      >
                        Login
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ ...styles.card, textAlign: "center" }}>
                    <p>Cannot add comments: No valid post ID</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ImageModal 
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={() => setShowImageModal(false)}
      />
      
      <ActionSheet
        show={showActionSheet}
        title="خيارات المنشور"
        post={post}
        onSelect={handleActionSheetOption}
        onClose={() => setShowActionSheet(false)}
        options={[
          { id: "view", label: "عرض المنشور" },
          { id: "share", label: "مشاركة المنشور" },
          { id: "cancel", label: "إلغاء" }
        ]}
      />
    </div>
  );
};

export default GetPost;
