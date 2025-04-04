import React from "react";
import "./ActionSheet.css";

const ActionSheet = ({ show, title, post, options = [], onSelect, onClose }) => {
  if (!show) return null;
  
  // Enhanced debugging for post data
  console.log("ActionSheet rendering with post:", post);
  if (post && post.Post_Images) {
    console.log("Post has images:", post.Post_Images);
    post.Post_Images.forEach((img, idx) => {
      console.log(`Image ${idx} data:`, img);
    });
  }

  return (
    <>
      <div 
        className={`action-sheet-backdrop ${show ? 'visible' : ''}`} 
        onClick={onClose}
      ></div>
      <div 
        className={`action-sheet ${show ? 'visible' : ''}`}
      >
        <div className="action-sheet-title">{title}</div>
        {options.map(option => (
          <button
            key={option.id}
            className="action-sheet-button"
            onClick={() => {
              if (option.id === "cancel") {
                onClose();
              } else if (post) {
                // Debug log
                console.log(`Selected option ${option.id} for post:`, post);
                // Ensure post has _id property
                const postWithId = {
                  ...post,
                  _id: post._id || post.id // Ensure _id exists
                };
                onSelect(option.id, postWithId);
              } else {
                onClose();
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ActionSheet; 