import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import axios from "../config/axios";
import { GET_MY_POSTS, DELETE_POST, API_URL } from "../config/urls";
import { AuthContext } from "../context/AuthContext";

// Extracted components
import Loading from "../components/UI/Loading";
import Alert from "../components/UI/Alert";
import ActionSheet from "../components/UI/ActionSheet";
import PostCard from "../components/Post/PostCard";
import { EmptyState } from "../components/UI/EmptyState";

// Import CSS
import "./myPosts.css";

const MyPosts = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postId, setPostId] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionSheetPostId, setActionSheetPostId] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { jwt, loggedIn } = useContext(AuthContext);

  console.log("MyPosts component - Auth state:", { loggedIn, hasJwt: !!jwt });

  // Check if user is authenticated
  useEffect(() => {
    console.log("Auth check effect running", { jwt, loggedIn });
    if (!jwt || !loggedIn) {
      console.log("User not logged in, redirecting to login");
      navigate("/account/login");
      return;
    }
  }, [jwt, loggedIn, navigate]);

  useEffect(() => {
    if (jwt) {
      console.log("JWT available, getting posts");
      getPosts();
    }
  }, [jwt]);

  // Check for refresh state when component mounts or location changes
  useEffect(() => {
    if (location.state?.refresh) {
      // Clear the state to prevent endless refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Refresh posts
      getPosts();
    }
  }, [location]);

  const getPosts = async () => {
    console.log("Fetching posts with JWT:", { jwtAvailable: !!jwt });
    setShowLoading(true);
    setError(null);
    try {
      console.log("Making API request to:", GET_MY_POSTS);
      const res = await axios.get(GET_MY_POSTS, {
        headers: {
          Authorization: jwt,
        },
      });
      console.log("Posts fetched successfully:", res.data);
      setPosts(res.data);
    } catch (e) {
      console.error("Error fetching posts:", e);
      console.error("Error details:", e.response || e.message);
      setError("حدث خطأ أثناء تحميل المنشورات");
      // If unauthorized, redirect to login
      if (e.response && e.response.status === 401) {
        console.log("Unauthorized, redirecting to login");
        navigate("/account/login");
      }
    } finally {
      setShowLoading(false);
    }
  };

  const deletePost = async () => {
    setShowLoading(true);
    setError("");
    
    try {
      console.log("Attempting to delete post with ID:", postId);
      
      if (!postId) {
        setError("معرف المنشور غير صالح");
        setShowLoading(false);
        return;
      }
      
      const response = await axios.delete(DELETE_POST, {
        data: { postId },
        headers: { Authorization: jwt },
      });
      
      console.log("Delete response:", response.data);
      setError("");
      getPosts();
    } catch (e) {
      console.error("Error deleting post:", e);
      
      if (e.response && e.response.data) {
        console.error("Server error response:", e.response.data);
        setError(e.response.data.error || e.response.data.message || "حدث خطأ أثناء حذف المنشور");
      } else {
        setError("حدث خطأ أثناء حذف المنشور");
      }
    } finally {
      setShowLoading(false);
    }
  };

  const handleActionSheetOption = (option, post) => {
    switch (option) {
      case "edit":
        navigate(`/my-posts/${post._id}`);
        break;
      case "view":
        navigate(`/posts/${post._id}`);
        break;
      case "delete":
        console.log("Deleting post with ID:", post._id);
        setPostId(post._id);
        setShowAlert(true);
        break;
      default:
        break;
    }
    setShowActionSheet(false);
  };

  if (!jwt) {
    return null; // Prevent rendering until authentication check completes
  }

  return (
    <div className="page">
      <Loading show={showLoading} />

      <Alert
        show={showAlert}
        title="تنبيه!"
        message="هل تود بالفعل حذف المنشور"
        confirmText="نعم"
        cancelText="إلغاء"
        onConfirm={() => {
          setShowAlert(false);
          deletePost();
        }}
        onCancel={() => setShowAlert(false)}
      />

      <Header headerTitle="منشوراتي" defaultHref="/posts" />

      <div className="content">
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#ffeded',
            border: '1px solid #ff5252',
            color: '#d32f2f',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            direction: 'rtl'
          }}>
            {error}
          </div>
        )}

        {!jwt && (
          <div style={{
            backgroundColor: '#ffefd5',
            border: '1px solid #ffc107',
            color: '#bf6c07',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            direction: 'rtl'
          }}>
            لم يتم العثور على JWT. يرجى تسجيل الدخول مرة أخرى.
          </div>
        )}

        <div className="grid">
          {posts && posts.length > 0 ? (
            posts
              .slice()
              .reverse()
              .map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  imageUrl={post.Post_Images && post.Post_Images.length > 0 
                    ? `${API_URL}/${post.Post_Images[0].img_uri}` 
                    : ""}
                  onOptionsClick={() => {
                    console.log("Opening action sheet for post:", post);
                    setActionSheetPostId(post);
                    setShowActionSheet(true);
                  }}
                />
              ))
          ) : (
            <EmptyState message="لايوجد منشورات لعرضها" />
          )}
        </div>
      </div>

      <ActionSheet
        show={showActionSheet}
        title="تفاصيل المنشور"
        post={actionSheetPostId}
        onSelect={handleActionSheetOption}
        onClose={() => setShowActionSheet(false)}
        options={[
          { id: "edit", label: "تعديل المنشور" },
          { id: "view", label: "الانتقال للمنشور" },
          { id: "delete", label: "حذف المنشور" },
          { id: "cancel", label: "إلغاء" }
        ]}
      />
    </div>
  );
};

export default MyPosts;
