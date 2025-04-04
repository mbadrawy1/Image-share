import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = (props) => {
  const navigate = useNavigate();
  
  // Add toggleMenu function to handle menu visibility
  const toggleMenu = () => {
    console.log('Header: toggleMenu clicked');
    // Create a custom event that can be listened to by the Menu component
    const event = new CustomEvent('toggleMenu');
    window.dispatchEvent(event);
    console.log('Header: toggleMenu event dispatched');
  };

  // Function to handle back button click
  const handleBackClick = () => {
    if (props.defaultHref) {
      navigate(props.defaultHref);
    } else {
      window.history.back();
    }
  };

  return (
    <header
      style={{
        backgroundColor: "#3880ff",
        color: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "56px",
        }}
      >
        {/* Back Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            visibility: props.disabledBackButton ? "hidden" : "visible",
          }}
        >
          <button
            onClick={handleBackClick}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              color: "white",
            }}
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.4-33.9 0L175 239c-9.4 9.4-9.4 24.6 0 33.9l136 136c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.4-24.6 0-33.9L217.9 256z"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 500,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {props.headerTitle}
        </h1>

        {/* Menu Button */}
        <div>
          <button
            onClick={toggleMenu}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              color: "white",
            }}
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 512 512"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="32"
                d="M80 160h352M80 256h352M80 352h352"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
