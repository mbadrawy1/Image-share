import { useContext, useEffect, useState } from "react";
import avatar from "../../pages/assets/images/avatar.png";
import usePhotoGallery from "../../hooks/usePhotoGallery.js";
import axios from "../../config/axios.js";
import { UPLOAD_USER_PHOTO, API_URL } from "../../config/urls.js";
import { AuthContext } from "../../context/AuthContext.jsx";

const UserAvatar = (props) => {
  const [userImg, setUserImg] = useState(props.userImg);
  const [isUploading, setIsUploading] = useState(false);
  const { jwt } = useContext(AuthContext);
  const { takePhoto, blobUrl } = usePhotoGallery();

  useEffect(() => {
    if (blobUrl) {
      setUserImg(blobUrl);
      uploadPhoto();
    }
  }, [blobUrl]);

  const uploadPhoto = async () => {
    if (!blobUrl) return;
    
    setIsUploading(true);
    const photoData = new FormData();
    try {
      // For blob URLs, we need to fetch the blob first
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      photoData.append("avatar", blob);
      
      console.log("Uploading photo...");
      const uploadResponse = await axios.put(UPLOAD_USER_PHOTO, photoData, {
        headers: {
          Authorization: jwt,
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("Upload successful:", uploadResponse);
      props.imgUri(blobUrl);
    } catch (e) {
      console.error("Upload error:", e);
      alert("فشل تحميل الصورة. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPhoto = () => {
    console.log("Photo selection initiated");
    takePhoto();
  };

  // Avatar container style
  const avatarContainerStyle = {
    position: "relative",
    display: "inline-block",
    margin: "16px",
  };

  // Avatar style
  const avatarStyle = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "2px solid #ffffff",
    opacity: isUploading ? 0.7 : 1,
  };

  // Image style
  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  // Add icon style
  const iconStyle = {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    backgroundColor: "#3880ff",
    color: "white",
    borderRadius: "50%",
    padding: "4px",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={avatarContainerStyle}>
      <div style={avatarStyle}>
        <img
          src={userImg 
            ? (userImg.startsWith('blob:') || userImg.startsWith('http') 
                ? userImg 
                : `${API_URL}/${userImg}`) 
            : avatar}
          alt="User avatar"
          style={imgStyle}
          onError={(e) => {
            console.error("Image load error, falling back to default avatar");
            e.target.src = avatar;
          }}
        />
      </div>
      <div
        style={iconStyle}
        onClick={handleSelectPhoto}
        title="اختر صورة"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M256 112v288m144-144H112"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
          />
        </svg>
      </div>
      {isUploading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.5)",
          borderRadius: "50%"
        }}>
          <span style={{ fontSize: "10px" }}>جاري التحميل...</span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
