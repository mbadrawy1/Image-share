import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { GET_ALL_POSTS, API_URL, IMAGE_BASE_URL } from "../config/urls";
import { AuthContext } from "../context/AuthContext";
import { Preferences } from "@capacitor/preferences";
import moment from "moment";
import "moment/locale/ar";
import Header from "../components/Header/Header";
import avatar from "./assets/images/avatar.png";
import Like from "../components/Like/Like";
import CreateComment from "../components/Comment/CreateComment";
import Loading from "../components/UI/Loading";
import Alert from "../components/UI/Alert";
import ActionSheet from "../components/UI/ActionSheet";
import "../components/UI/ActionSheet.css";
import PostCard from "../components/Post/PostCard";

moment.locale("ar");

// Placeholder SVG for missing images
const NO_IMAGE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

// Helper function to get post image URL
const getPostImageUrl = (post) => {
  if (post.images && post.images.length > 0) {
    const image = post.images[0];
    if (typeof image === 'object' && image.filename) {
      return `${IMAGE_BASE_URL}/${image.filename}`;
    } else if (typeof image === 'string') {
      return `${IMAGE_BASE_URL}/${image}`;
    }
  } 
  
  if (post.Post_Images && post.Post_Images.length > 0) {
    const postImage = post.Post_Images[0];
    if (postImage.filename) {
      return `${IMAGE_BASE_URL}/${postImage.filename}`;
    } else if (postImage.id) {
      return `${IMAGE_BASE_URL}/${postImage.id}`;
    }
  }
  
  return NO_IMAGE_SVG;
};

// Helper function to get user avatar URL
const getUserAvatarUrl = (user) => {
  return user && user.img_uri
    ? `${IMAGE_BASE_URL}${user.img_uri}`
    : avatar;
};

const GetAllPosts = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { jwt, setLoggedIn, guestMode } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // No longer redirecting to login if no JWT
    getPosts();
  }, [navigate]);

  useEffect(() => {
    const handleBackButton = () => {
      if (window.location.pathname === "/account/login") {
        setShowAlert(true);
        return true;
      } else {
        navigate(-1);
        return true;
      }
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [navigate]);

  const getPosts = async () => {
    setShowLoading(true);
    try {
      let response;
      if (jwt) {
        // Authenticated request with JWT
        response = await axios.get(GET_ALL_POSTS, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        // Guest request without authentication
        response = await axios.get(GET_ALL_POSTS);
      }
      
      setPosts(response.data);
    } catch (e) {
      console.error("Error fetching posts:", e);
      if (e.response && e.response.status === 401 && jwt) {
        // Only clear tokens if we were trying to use authentication
        await Preferences.remove({ key: "accessToken" });
        localStorage.removeItem("accessToken");
        setLoggedIn(false);
      }
    } finally {
      setShowLoading(false);
      setIsRefreshing(false);
    }
  };

  const logOut = async () => {
    await Preferences.remove({ key: "accessToken" });
    localStorage.removeItem("accessToken");
    setLoggedIn(false);
    navigate("/account/login");
  };

  const doRefresh = () => {
    setIsRefreshing(true);
    setTimeout(getPosts, 1000);
  };

  const handleImageError = (e, post) => {
    if (post.images && post.images.length > 0) {
      const imageData = post.images[0];
      
      if (typeof imageData === 'object') {
        const possibleProperties = ['filename', 'path', 'name', 'img_uri', 'uri'];
        
        for (const prop of possibleProperties) {
          if (imageData[prop]) {
            const imageName = imageData[prop].split('/').pop();
            // Try alternative path
            e.target.src = `${API_URL}/uploads/${imageName}`;
            // Add a backup error handler to try the /images path as fallback
            e.target.onerror = () => {
              e.target.onerror = null; // Prevent infinite recursion
              e.target.src = NO_IMAGE_SVG;
            };
            return;
          }
        }
        
        if (imageData._id) {
          e.target.src = `${API_URL}/uploads/${imageData._id}`;
          e.target.onerror = () => {
            e.target.onerror = null;
            e.target.src = NO_IMAGE_SVG;
          };
          return;
        }
      } else if (typeof imageData === 'string') {
        e.target.src = `${API_URL}/uploads/${imageData}`;
        e.target.onerror = () => {
          e.target.onerror = null;
          e.target.src = NO_IMAGE_SVG;
        };
        return;
      }
    }
    
    e.target.onerror = null;
    e.target.src = NO_IMAGE_SVG;
  };

  const navigateToPost = (postId) => {
    if (postId && /^[0-9a-f]{24}$/i.test(postId)) {
      navigate(`/posts/${postId}`);
    } else {
      alert("Cannot view this post: Invalid post ID");
    }
  };

  const promptLogin = () => {
    setShowLoginPrompt(true);
    setTimeout(() => {
      setShowLoginPrompt(false);
    }, 3000);
  };

  const handleActionSelect = async (actionId, post) => {
    setShowActionSheet(false);
    
    switch (actionId) {
      case 'view':
        navigateToPost(post._id);
        break;
      case 'share':
        // Share functionality would go here
        alert('Sharing is not implemented yet');
        break;
      case 'report':
        if (!jwt) {
          promptLogin();
        } else {
          // Report functionality would go here
          alert('Reporting is not implemented yet');
        }
        break;
      default:
        break;
    }
  };

  const actionSheetOptions = [
    { id: 'view', label: 'عرض المنشور' },
    { id: 'share', label: 'مشاركة' },
    { id: 'report', label: 'إبلاغ' },
    { id: 'cancel', label: 'إلغاء' }
  ];

  const renderPostCard = (post) => {
    console.log("Rendering post card for post:", post);
    return (
      <PostCard 
        key={post._id}
        post={post}
        imageUrl={getPostImageUrl(post)}
        onClick={() => navigateToPost(post._id)}
        onOptionsClick={(e) => {
          e.stopPropagation();
          console.log("Options clicked for post:", post);
          setSelectedPost(post);
          setShowActionSheet(true);
        }}
        promptLogin={promptLogin}
      />
    );
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

  const renderLogoutAlert = () => (
    <div style={styles.alertOverlay}>
      <div style={styles.alertBox}>
        <h2 style={styles.alertHeader}>تنبيه!</h2>
        <h3 style={styles.alertSubHeader}>
          أنت على وشك تسجيل الخروج
        </h3>
        <p style={styles.alertMessage}>
          هل تريد تسجيل الخروج بالفعل؟
        </p>
        <div style={styles.alertButtons}>
          <button style={styles.alertButtonPrimary} onClick={logOut}>
            موافق
          </button>
          <button
            style={styles.alertButtonSecondary}
            onClick={() => setShowAlert(false)}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Loading show={showLoading} />
      <Alert
        show={showAlert}
        title="تنبيه!"
        message="هل أنت متأكد أنك تريد الخروج؟"
        confirmText="نعم"
        cancelText="إلغاء"
        onConfirm={() => {
          logOut();
          setShowAlert(false);
        }}
        onCancel={() => setShowAlert(false)}
      />
      {renderLoginPrompt()}
      
      <ActionSheet
        show={showActionSheet}
        title="خيارات المنشور"
        post={selectedPost}
        options={actionSheetOptions}
        onSelect={handleActionSelect}
        onClose={() => setShowActionSheet(false)}
      />
      
      <Header headerTitle="المنشورات" />
      
      <div style={styles.content}>
        {isRefreshing && (
          <div style={styles.refreshIndicator}>
            <div style={styles.refreshSpinner}></div>
          </div>
        )}

        <div style={styles.pullToRefresh} onTouchEnd={doRefresh}></div>

        <div style={styles.grid}>
          <div style={styles.row}>
            {posts.length > 0 ? (
              posts.slice().reverse().map(renderPostCard)
            ) : (
              <div style={styles.emptyCol}>
                <div style={styles.emptyCard}>
                  <h2 style={styles.emptyTitle}>لايوجد منشورات لعرضها</h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles extracted to a separate object
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3880ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  alertOverlay: {
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
  alertBox: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    width: "80%",
    maxWidth: "400px",
    textAlign: "center",
  },
  alertHeader: {
    margin: "0 0 10px 0",
    color: "#222",
  },
  alertSubHeader: {
    margin: "0 0 10px 0",
    color: "#666",
    fontWeight: "normal",
  },
  alertMessage: {
    margin: "0 0 20px 0",
  },
  alertButtons: {
    display: "flex",
    justifyContent: "space-around",
  },
  alertButtonPrimary: {
    padding: "10px 20px",
    backgroundColor: "#3880ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  alertButtonSecondary: {
    padding: "10px 20px",
    backgroundColor: "#f4f5f8",
    color: "#222",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "16px",
    overflow: "auto",
    position: "relative",
  },
  refreshIndicator: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
  },
  refreshSpinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #3880ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  pullToRefresh: {
    height: "60px",
    marginTop: "-60px",
    textAlign: "center",
    transition: "margin-top 0.2s",
  },
  grid: {
    width: "100%",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    margin: "0 -15px",
  },
  col: {
    flex: "0 0 100%",
    padding: "0 15px",
    marginBottom: "20px",
  },
  emptyCol: {
    flex: "0 0 100%",
    padding: "0 15px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    cursor: "pointer",
  },
  emptyCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    textAlign: "center",
  },
  emptyTitle: {
    color: "#3880ff",
    margin: 0,
  },
  postImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  cardContent: {
    padding: "16px",
  },
  cardGrid: {
    width: "100%",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
    marginRight: "15px",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  userInfoCol: {
    flex: 1,
  },
  postUser: {
    fontWeight: "bold",
    color: "#222",
  },
  postMoment: {
    color: "#ff9800",
    fontSize: "14px",
  },
  postTitle: {
    margin: "10px 0",
    color: "#3880ff",
    fontWeight: "bold",
    fontSize: "18px",
  },
  postContentsLabel: {
    margin: "0",
    color: "#666",
    fontSize: "14px",
    fontWeight: "normal",
  },
  postContents: {
    margin: "0",
    color: "#666",
    fontSize: "14px",
    fontWeight: "normal",
  },
  actions: {
    marginTop: "10px",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

export default GetAllPosts;