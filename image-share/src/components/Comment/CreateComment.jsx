import { useContext, useState, useEffect } from "react";
import axios from "../../config/axios";
import { GET_ALL_POSTS } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";

const CreateComment = (props) => {
  const [newComment, setNewComment] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { jwt } = useContext(AuthContext);
  
  // Get post ID from props instead of trying to extract from URL
  const { postId } = props;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const onSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const comment = {
      text: newComment,
    };
    
    if (!postId) {
      setToastMessage("Invalid post ID");
      setShowToast(true);
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Submitting comment:", comment);
      console.log("Using token:", jwt ? "JWT present" : "No JWT");
      console.log("Post ID:", postId);
      
      const response = await axios.post(`${GET_ALL_POSTS}/${postId}/create-comment`, comment, {
        headers: {
          Authorization: jwt,
          "Content-Type": "application/json"
        },
      });
      
      console.log("Comment submitted successfully:", response.data);
      setNewComment("");
      props.sendToParent(response.data.comment || newComment);
    } catch (e) {
      console.error("Error submitting comment:", e);
      let errorMsg = "Failed to submit comment";
      
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
      
      setToastMessage(errorMsg);
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = () => {
    if (!jwt) {
      setToastMessage("You need to be logged in to comment");
      setShowToast(true);
      return;
    }
    
    if (!postId) {
      setToastMessage("Invalid post ID");
      setShowToast(true);
      return;
    }
    
    if (!newComment.trim()) {
      setToastMessage("يجب عليك إدخال تعليق (Please enter a comment)");
      setShowToast(true);
      return;
    }
    
    onSubmit();
  };

  return (
    <div style={styles.commentContainer}>
      <div style={styles.commentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            ...styles.commentInput,
            border: isFocused ? "2px solid #ff9800" : "1px solid #e0e0e0",
            boxShadow: isFocused ? "0 0 5px rgba(255, 152, 0, 0.2)" : "none",
            direction: "auto",
          }}
          disabled={isSubmitting || !postId}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          onClick={validation}
          style={{
            ...styles.sendButton,
            backgroundColor: isSubmitting || !postId ? "#ccc" : "#ff9800",
            cursor: isSubmitting || !postId ? "default" : "pointer",
            transform: isSubmitting || !postId ? "none" : "scale(1)",
          }}
          onMouseOver={(e) => {
            if (!isSubmitting && postId) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting && postId) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
            }
          }}
          disabled={isSubmitting || !postId}
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>

      {showToast && (
        <div style={styles.toast}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

// Separated styles for better maintainability
const styles = {
  commentContainer: {
    marginBottom: "20px",
    position: "relative",
  },
  commentForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #eaeaea",
  },
  commentInput: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "20px",
    minHeight: "45px",
    resize: "none",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    padding: "12px 22px",
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  toast: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#dc3545",
    color: "white",
    padding: "12px 24px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    fontSize: "14px",
    fontWeight: "500",
  }
};

export default CreateComment;
