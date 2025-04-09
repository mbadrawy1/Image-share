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
import { getImageUrl, generateImageUrlCandidates } from "../utils/imageUtils";

moment.locale("ar");

// صورة SVG بديلة للصور المفقودة
const NO_IMAGE_SVG = "/favicon.png";

// دالة مساعدة للحصول على عنوان URL لصورة المنشور
const getPostImageUrl = (post) => {
  // First try using the imageUtils function
  if (post.images && post.images.length > 0) {
    return getImageUrl(post.images[0]);
  } 
  
  if (post.Post_Images && post.Post_Images.length > 0) {
    return getImageUrl(post.Post_Images[0]);
  }
  
  // Fallback to the old logic if needed
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

// دالة مساعدة للحصول على عنوان URL للصورة الرمزية للمستخدم
const getUserAvatarUrl = (user) => {
  return user && user.img_uri
    ? `${IMAGE_BASE_URL}/${user.img_uri.startsWith('/') ? user.img_uri.substring(1) : user.img_uri}`
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
    // لم يعد يتم إعادة التوجيه إلى صفحة تسجيل الدخول في حالة عدم وجود JWT
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
        // طلب مصادق عليه باستخدام JWT
        response = await axios.get(GET_ALL_POSTS, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        // طلب زائر بدون مصادقة
        response = await axios.get(GET_ALL_POSTS);
      }
      
      setPosts(response.data);
    } catch (e) {
      console.error("Error fetching posts:", e);
      if (e.response && e.response.status === 401 && jwt) {
        // مسح الرموز فقط إذا كنا نحاول استخدام المصادقة
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
    console.log("Image load error, trying fallbacks");
    
    // Try to get image data
    let imageData = null;
    if (post.images && post.images.length > 0) {
      imageData = post.images[0];
    } else if (post.Post_Images && post.Post_Images.length > 0) {
      imageData = post.Post_Images[0];
    }
    
    if (imageData) {
      // Generate all possible URLs for this image
      const urlCandidates = generateImageUrlCandidates(imageData);
      
      // Find current URL index
      const currentIndex = urlCandidates.indexOf(e.target.src);
      
      // Try next URL if available
      if (currentIndex >= 0 && currentIndex < urlCandidates.length - 1) {
        const nextUrl = urlCandidates[currentIndex + 1];
        console.log("Trying next URL:", nextUrl);
        e.target.src = nextUrl;
        return;
      }
    }
    
    // Use placeholder as last resort
    console.log("Using placeholder image");
    e.target.src = NO_IMAGE_SVG;
    e.target.onerror = null; // Prevent further errors
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
        // وظيفة المشاركة ستكون هنا
        alert('Sharing is not implemented yet');
        break;
      case 'report':
        if (!jwt) {
          promptLogin();
        } else {
          // وظيفة الإبلاغ ستكون هنا
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
        userAvatarUrl={post.user ? getUserAvatarUrl(post.user) : null}
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
        justifyContent: "center",
        width: "80%",
        maxWidth: "400px",
      }}>
        يجب عليك تسجيل الدخول للقيام بهذا الإجراء
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
    display: "flex",
    justifyContent: "center",
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
    maxWidth: "800px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    margin: "0",
  },
  col: {
    flex: "0 0 100%",
    padding: "0 15px",
    marginBottom: "20px",
    maxWidth: "800px",
  },
  emptyCol: {
    flex: "0 0 100%",
    padding: "0 15px",
    maxWidth: "800px",
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