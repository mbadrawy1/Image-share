import { useContext, useEffect, useState } from "react";
import axios from "../../config/axios";
import { GET_ALL_POSTS } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";

const Like = (props) => {
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [refreshLike, setRefreshLike] = useState(false);
  const [error, setError] = useState(null);
  const { jwt, guestMode } = useContext(AuthContext);
  const { postId, showCount = false } = props;
  
  useEffect(() => {
    if (postId) { // Make sure postId exists before making API calls
      getLikes();
    }
  }, [postId, refreshLike]);

  useEffect(() => {
    sendLikeCount();
  }, [likeCount]);

  const getLikes = async () => {
    if (!postId) {
      console.log("Missing postId, skipping like count fetch");
      return;
    }
    
    try {
      console.log(`Fetching likes for post ID: ${postId}`);
      
      // Configure request based on authentication status
      const config = jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : {};
      
      const response = await axios.get(
        `${GET_ALL_POSTS}/${postId}/like-count`,
        config
      );
      
      console.log("Like count response:", response.data);
      setLikeCount(response.data.likes);
      setUserLiked(response.data.userLiked);
      setError(null);
    } catch (e) {
      console.error("Error fetching likes:", e);
      setError("Could not fetch likes");
      
      if (e.response?.status === 401 && jwt) {
        console.warn("Authentication issue detected with like count");
      }
    }
  };

  const handleLike = async () => {
    if (!jwt) {
      console.error("Cannot like post: JWT is missing");
      return;
    }
    
    if (!postId) {
      console.error("Cannot like post: postId is missing");
      return;
    }
    
    try {
      console.log(`Toggling like for post ID: ${postId}`);
      const response = await axios.put(
        `${GET_ALL_POSTS}/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      console.log("Like toggle response:", response.data);
      setRefreshLike(!refreshLike);
      setError(null);
    } catch (e) {
      console.error("Error toggling like:", e);
      setError("Could not update like");
      
      if (e.response?.status === 401) {
        console.warn("Authentication issue detected when liking post");
      }
    }
  };

  const sendLikeCount = () => {
    if (typeof props.sendToParent === 'function') {
      props.sendToParent(likeCount);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        position: "relative",
      }}
    >
      {error && (
        <div style={{ 
          position: "absolute", 
          bottom: "-20px", 
          left: 0, 
          fontSize: "0.7rem", 
          color: "#ff3860",
          whiteSpace: "nowrap"
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
        style={{
          background: "none",
          border: "none",
          padding: "8px",
          cursor: jwt ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          opacity: jwt ? 1 : 0.7,
        }}
        aria-label={userLiked ? "Unlike post" : "Like post"}
        disabled={!jwt}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 512 512"
          fill={userLiked ? "#ff3860" : "#3880ff"}
        >
          <path d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0018 0c96.26-65.34 184.09-143.09 183-252.42-.54-52.67-42.32-96.81-95.08-96.81z" />
        </svg>
      </button>
      
      {(showCount || likeCount > 0) && (
        <span
          style={{
            color: userLiked ? "#ff3860" : "#3880ff",
            fontSize: "0.9rem",
          }}
        >
          {likeCount}
        </span>
      )}
    </div>
  );
};

export default Like;