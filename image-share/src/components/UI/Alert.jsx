import React from "react";
import "./Alert.css";

const Alert = ({ 
  show, 
  title = "تنبيه!", 
  message, 
  confirmText = "نعم", 
  cancelText = "إلغاء", 
  onConfirm, 
  onCancel 
}) => {
  if (!show) return null;

  return (
    <div className="alert">
      <h3 className="alert-header">{title}</h3>
      <p className="alert-message">{message}</p>
      <div className="alert-buttons">
        <button className="alert-button" onClick={onConfirm}>
          {confirmText}
        </button>
        <button className="cancel-button" onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default Alert; 