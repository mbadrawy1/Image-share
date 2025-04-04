import { useContext, useEffect, useState } from "react";
import axios from "../../config/axios";
import { GET_ALL_POSTS, API_URL } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";
import avatar from "../../pages/assets/images/avatar.png";

const GetComment = (props) => {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { jwt } = useContext(AuthContext);
  
  // Get the postId prop passed from parent
  const { postId } = props;
  
  useEffect(() => {
    if (postId) {
      console.log("GetComment - Using postId from props:", postId);
      getComments(postId);
    } else {
      console.error("GetComment - No valid postId provided");
      setError("Invalid post ID");
      setLoading(false);
    }
  }, [props.comment, postId]);

  const getComments = async (id) => {
    setLoading(true);
    try {
      console.log("Fetching comments for post:", id);
      const config = jwt ? { headers: { Authorization: jwt } } : {};
      const response = await axios.get(
        `${GET_ALL_POSTS}/${id}/get-comments`,
        config
      );
      console.log("Comments data received:", response.data);
      
      if (Array.isArray(response.data)) {
        setComments(response.data);
        setError(null);
      } else {
        console.error("Expected array of comments but got:", response.data);
        setError("Invalid comment data format");
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
      let errorMsg = "Failed to load comments";
      
      if (e.response) {
        console.error("Response data:", e.response.data);
        console.error("Response status:", e.response.status);
        errorMsg = e.response.data?.error || errorMsg;
      } else if (e.request) {
        console.error("No response received:", e.request);
        errorMsg = "No response from server";
      } else {
        console.error("Error:", e.message);
        errorMsg = e.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (comment) => {
    // Check both user and User fields (handle different API response formats)
    if (comment.user && typeof comment.user === 'object') {
      return comment.user.name || 'Anonymous';
    } else if (comment.User && typeof comment.User === 'object') {
      return comment.User.name || 'Anonymous';
    }
    return 'Anonymous';
  };

  const getAvatarUrl = (imgUrl) => {
    return imgUrl ? `${API_URL}/${imgUrl}` : avatar;
  };

  const getUserAvatar = (comment) => {
    let imgUrl = null;
    
    // Check for populated user object
    if (comment.user && typeof comment.user === 'object' && comment.user.img_uri) {
      imgUrl = comment.user.img_uri;
    } 
    // Check for User with capital U (legacy format)
    else if (comment.User && typeof comment.User === 'object' && comment.User.img_uri) {
      imgUrl = comment.User.img_uri;
    }
    
    return getAvatarUrl(imgUrl);
  };

  if (error) {
    return (
      <div style={{ 
        padding: "10px", 
        backgroundColor: "#f8d7da", 
        color: "#721c24",
        borderRadius: "4px",
        marginBottom: "16px"
      }}>
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#e0e0e0",
              animation: "pulse 1.5s infinite",
            }}
          />
          <div
            style={{
              height: "16px",
              width: "120px",
              background: "#e0e0e0",
              borderRadius: "4px",
              animation: "pulse 1.5s infinite",
            }}
          />
        </div>
        <div
          style={{
            height: "16px",
            width: "80%",
            background: "#e0e0e0",
            borderRadius: "4px",
            animation: "pulse 1.5s infinite",
          }}
        />
      </div>
    );
  }

  if (!postId) {
    return (
      <div style={{ 
        padding: "10px", 
        backgroundColor: "#f8d7da", 
        color: "#721c24",
        borderRadius: "4px",
        marginBottom: "16px"
      }}>
        Invalid post ID
      </div>
    );
  }

  return (
    <div style={{ margin: 0 }}>
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div
            key={comment._id || comment.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "16px",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={getUserAvatar(comment)}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatar;
                }}
              />
            </div>

            <div
              style={{
                background: "#f5f5f5",
                borderRadius: "12px",
                padding: "12px",
                flexGrow: 1,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#ffc409",
                  fontSize: "0.875rem",
                  marginBottom: "4px",
                }}
              >
                {getUserName(comment)}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  lineHeight: 1.4,
                }}
              >
                {comment.text}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No comments yet
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default GetComment;
