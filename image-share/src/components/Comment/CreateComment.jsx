import { useContext, useState, useEffect } from "react";
import axios from "../../config/axios";
import { GET_ALL_POSTS } from "../../config/urls";
import { AuthContext } from "../../context/AuthContext";

const CreateComment = (props) => {
  const [newComment, setNewComment] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <div style={{ marginBottom: "20px", position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            minHeight: "40px",
            resize: "vertical",
          }}
          disabled={isSubmitting || !postId}
        />
        <button
          onClick={validation}
          style={{
            padding: "8px 16px",
            backgroundColor: isSubmitting || !postId ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSubmitting || !postId ? "default" : "pointer",
          }}
          disabled={isSubmitting || !postId}
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>

      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CreateComment;
