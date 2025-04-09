import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Assuming axios is imported directly
import { Preferences } from "@capacitor/preferences";

// Replace these with your actual imports
import avatar from '../../pages/assets/images/avatar.png';
import { AuthContext } from "../../context/AuthContext";
import { PROFILE_URL, API_URL } from "../../config/urls";

const Menu = ({ initialIsOpen = false }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [name, setName] = useState("");
  const [profileImg, setProfileImg] = useState();
  const [side, setSide] = useState("start");
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const { jwt, setLoggedIn, guestMode } = useContext(AuthContext);
  const navigate = useNavigate(); // React Router v6 equivalent of useNavigate

  useEffect(() => {
    const x = window.matchMedia("(max-width: 992px)");
    myFunction(x);
    
    // Modern way to add listener
    const listener = (e) => myFunction(e);
    x.addEventListener('change', listener);
    
    // Listen for toggle menu events from Header component
    const handleToggleMenu = () => {
      console.log('Toggle menu event received');
      setIsOpen(prevState => !prevState);
    };
    
    window.addEventListener('toggleMenu', handleToggleMenu);
    
    // For debugging
    console.log('Menu component: Event listener for toggleMenu added');
    
    return () => {
      x.removeEventListener('change', listener);
      window.removeEventListener('toggleMenu', handleToggleMenu);
      console.log('Menu component: Event listener for toggleMenu removed');
    };
  }, []);

  const myFunction = (x) => {
    if (x.matches) {
      setSide("end");
    } else {
      setSide("start");
    }
  };

  useEffect(() => {
    if (jwt) {
      getProfile();
    }
  }, [jwt]);

  const getProfile = async () => {
    setShowLoading(true);
    try {
      const res = await axios.get(PROFILE_URL, {
        headers: { Authorization: jwt },
      });
      setName(res.data.name);
      setProfileImg(res.data.img_uri);
      setShowLoading(false);
    } catch (e) {
      console.log(e);
      setShowLoading(false);
    }
  };

  const logOut = async () => {
    await Preferences.remove({ key: "accessToken" });
    localStorage.removeItem("accessToken");
    setLoggedIn(false);
    navigate("/posts");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Calculate menu position based on side
  const menuPosition = side === "end" ? { right: 0 } : { left: 0 };

  return (
    <>
      {/* Overlay when menu is open */}
      {isOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
          onClick={toggleMenu}
        />
      )}

      {/* Menu button - only show if not covered by header button */}
      {false && (
        <button 
          onClick={toggleMenu}
          style={{
            position: "fixed",
            top: "10px",
            [side]: "10px",
            zIndex: 101,
            background: "none",
            border: "none",
            padding: "8px",
            cursor: "pointer",
            color: "#3880ff",
          }}
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
      )}

      {/* Menu panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          ...menuPosition,
          width: "260px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 10000,
          transform: isOpen ? "translateX(0)" : `translateX(${side === "end" ? "100%" : "-100%"})`,
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
          direction: "rtl", // For Arabic text
        }}
      >
        {showLoading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #3880ff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              backgroundColor: "#3880ff",
              color: "white",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}>
              <h1 style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 500,
              }}>قائمة</h1>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "16px 0",
            }}>
              {/* Avatar */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
              }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #3880ff",
                }}>
                  <img 
                    src={profileImg ? (profileImg.startsWith('http') ? profileImg : `${API_URL}/${profileImg}`) : avatar} 
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = avatar;
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <div style={{
                textAlign: "center",
                marginTop: "8px",
                marginBottom: "24px",
              }}>
                <h3 style={{
                  margin: 0,
                  color: "#ffb400",
                  fontWeight: 500,
                }}>{jwt && !guestMode ? (name || "User") : "Guest User"}</h3>
              </div>

              {/* Menu List */}
              <div>
                {/* Profile */}
                <div 
                  onClick={() => navigate('/account/profile')}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    textDecoration: "none",
                    color: "#000",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 512 512"
                    style={{ color: "#3880ff" }}
                  >
                    <path 
                      d="M258.9 48C141.92 46.42 46.42 141.92 48 258.9c1.56 112.19 92.91 203.54 205.1 205.1 117 1.6 212.48-93.9 210.88-210.88C462.44 140.91 371.09 49.56 258.9 48zm126.42 327.25a4 4 0 01-6.14-.32 124.27 124.27 0 00-32.35-29.59C321.37 329 289.11 320 256 320s-65.37 9-90.83 25.34a124.24 124.24 0 00-32.35 29.58 4 4 0 01-6.14.32A175.32 175.32 0 0180 259c-1.63-97.31 78.22-178.76 175.57-179S432 158.81 432 256a175.32 175.32 0 01-46.68 119.25z" 
                      fill="currentColor"
                    />
                    <path 
                      d="M256 144c-19.72 0-37.55 7.39-50.22 20.82s-19 32-17.57 51.93C191.11 256 221.52 288 256 288s64.83-32 67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39 151.44 275.59 144 256 144z" 
                      fill="currentColor"
                    />
                  </svg>
                  <span style={{ marginRight: "16px" }}>الصفحة الشخصية</span>
                </div>

                {/* My Posts */}
                <div 
                  onClick={() => navigate('/my-posts')}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    textDecoration: "none",
                    color: "#000",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 512 512"
                    style={{ color: "#3880ff" }}
                  >
                    <path 
                      d="M368 48h-96v112h-96V48H80a16 16 0 00-16 16v416a16 16 0 0016 16h288a16 16 0 0016-16V64a16 16 0 00-16-16zm-32 400H176V288h160zm0-208H176v-64h160z" 
                      fill="currentColor"
                    />
                    <path 
                      d="M176 128V48H80a16 16 0 00-16 16v416a16 16 0 0016 16h288a16 16 0 0016-16V64a16 16 0 00-16-16h-96v64" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="32"
                    />
                  </svg>
                  <span style={{ marginRight: "16px" }}>منشوراتي</span>
                </div>

                {/* Create Post */}
                <div 
                  onClick={() => navigate('/create-post')}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    textDecoration: "none",
                    color: "#000",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 512 512"
                    style={{ color: "#3880ff" }}
                  >
                    <path
                      d="M256 448h-96a64.07 64.07 0 01-64-64V128a64.07 64.07 0 0164-64h96M256 448h96a64.07 64.07 0 0064-64V128a64.07 64.07 0 00-64-64h-96"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                    />
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="32"
                      d="M256 128v256M320 224H192"
                    />
                  </svg>
                  <span style={{ marginRight: "16px" }}>إضافة منشور</span>
                </div>

                {/* Logout */}
                <button 
                  onClick={logOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    width: "100%",
                    textAlign: "right",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 512 512"
                    style={{ color: "#3880ff" }}
                  >
                    <path 
                      d="M304 336v40a40 40 0 01-40 40H104a40 40 0 01-40-40V136a40 40 0 0140-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="32"
                    />
                  </svg>
                  <span style={{ marginRight: "16px" }}>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Menu;