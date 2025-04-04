import React from "react";
import "./EmptyState.css";

export const EmptyState = ({ message }) => {
  return (
    <div className="empty-column">
      <div className="empty-card">
        <h3 className="empty-title">{message}</h3>
      </div>
    </div>
  );
}; 