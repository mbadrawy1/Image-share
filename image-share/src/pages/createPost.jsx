import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { CREATE_POST } from "../config/urls";
import { AuthContext } from "../context/AuthContext";
import { EditorState } from "draft-js";
import Header from "../components/Header/Header";
import GetLocation from "../components/Location/GetLocation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import  usePhotoGallery  from "../hooks/usePhotoGallery";

const CreatePost = () => {
  const [photos, setPhotos] = useState([]);
  const [country, setCountry] = useState();
  const [region, setRegion] = useState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showImageToast, setShowImageToast] = useState(false);
  const [showContentToast, setShowContentToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const { takePhoto, blobUrl } = usePhotoGallery();
  const navigate = useNavigate();
  const { jwt } = useContext(AuthContext);
  const takePhotoRef = useRef();

  useEffect(() => {
    if (blobUrl) {
      const imgUrls = [blobUrl, ...photos];
      setPhotos(imgUrls);
    }
  }, [blobUrl]);

  const swiper_settings = {
    navigation: true,
    pagination: {
      clickable: true,
    },
    
  };

  const onSubmit = async () => {
    const postData = new FormData();
    try {
      postData.append("title", title);
      postData.append("contents", content);
      postData.append("steps", "");
      postData.append("country", country);
      postData.append("region", region);

      for (let i = 0; i < photos.length; i++) {
        const response = await fetch(photos[i]);
        const blob = await response.blob();
        postData.append("postImg", blob);
      }

      console.log("Submitting post data to server...");
      const res = await axios.post(CREATE_POST, postData, {
        headers: {
          Authorization: jwt,
        },
      });
      
      // Log the complete response for debugging
      console.log("Post created successfully, full response:", res);
      console.log("Response data:", res.data);
      console.log("Response status:", res.status);
      
      // Reset form
      setPhotos([]);
      setTitle("");
      setContent("");
      
      // Determine post ID from response
      let postId = null;
      if (res.data && res.data._id) {
        postId = res.data._id;
        console.log("Post ID from _id:", postId);
      } else if (res.data && res.data.id) {
        postId = res.data.id;
        console.log("Post ID from id:", postId);
      } else if (res.data && typeof res.data === 'object') {
        console.log("Response data keys:", Object.keys(res.data));
        // Try to find any property that might be an ID
        for (const key in res.data) {
          if (key.toLowerCase().includes('id') && typeof res.data[key] === 'string') {
            console.log(`Potential ID found in property ${key}:`, res.data[key]);
            if (postId === null) {
              postId = res.data[key];
            }
          }
        }
      }
      
      if (postId) {
        console.log("Using post ID for redirect:", postId);
        localStorage.setItem("lastCreatedPostId", postId);
      } else {
        console.warn("Could not determine post ID from response");
      }
      
      setShowAlert(true);
    } catch (e) {
      console.error("Error creating post:", e);
      if (e.response) {
        console.error("Response status:", e.response.status);
        console.error("Response data:", e.response.data);
      }
      alert("Failed to create post. Please try again.");
    }
  };

  const validator = () => {
    if (photos.length > 0) {
      if (title && content) {
        onSubmit();
      } else {
        setShowContentToast(true);
      }
    } else {
      setShowImageToast(true);
    }
  };

  const handleAlertDismiss = () => {
    setShowAlert(false);
  };

  const handleAlertConfirm = () => {
    const newPostId = localStorage.getItem("lastCreatedPostId");
    if (newPostId) {
      console.log("Redirecting to newly created post with ID:", newPostId);
      
      // Use direct navigation to ensure a full page load
      window.location.href = `/posts/${newPostId}`;
      
      // We don't need to remove from localStorage here as the getPost component will handle it
    } else {
      console.warn("No post ID found in localStorage, falling back to posts list");
      // Fallback to posts list if ID not available
      navigate("/my-posts", { state: { refresh: true } });
    }
  };

  const handleImageToastDismiss = () => {
    setShowImageToast(false);
  };

  const handleContentToastDismiss = () => {
    setShowContentToast(false);
  };

  return (
    <div style={styles.page}>
      {showAlert && (
        <div style={styles.alert}>
          <div style={styles.alertContent}>
            <h3 style={styles.alertHeader}>عملية النشر تمت بنجاح</h3>
            <p style={styles.alertMessage}>
              تم نشر المنشور بنجاح. انقر "عرض المنشور" للانتقال إلى صفحة المنشور الجديد.
            </p>
            <button 
              style={styles.alertButton} 
              onClick={handleAlertConfirm}
            >
              عرض المنشور
            </button>
            <button
              style={{
                ...styles.alertButton,
                marginTop: "10px",
                backgroundColor: "#f4f5f8",
                color: "#333"
              }}
              onClick={handleAlertDismiss}
            >
              البقاء في هذه الصفحة
            </button>
          </div>
        </div>
      )}

      <Header headerTitle="نشر منشور" defaultHref="/posts" />

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.formColumn}>
            <div style={styles.list}>
              <div style={styles.formItem}>
                <label style={styles.formLabel}>العنوان</label>
                <input
                  style={styles.formInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={styles.formItem}>
                <label style={styles.formLabel}>الوصف</label>
                <textarea
                  style={styles.formTextarea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="أدخل وصف المنشور..."
                  rows={4}
                />
              </div>

              <GetLocation 
                country={(value) => setCountry(value)} 
                region={(value) => setRegion(value)} 
              />

              <div
                style={styles.photoUpload}
                ref={takePhotoRef}
                onClick={takePhoto}
              >
                <span>اضغط هنا لإضافة صورة</span>
              </div>

              <div style={styles.photoContainer}>
                {photos.length > 0 ? (
                  <Swiper
                    {...swiper_settings}
                    modules={[Pagination, Navigation]}
                  >
                    {photos.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={img}
                          alt={`Post image ${index}`}
                          style={styles.postImage}
                          onClick={() => takePhotoRef.current.click()}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div style={styles.iconContainer}>
                    <div
                      style={styles.imagesIcon}
                      onClick={() => takePhotoRef.current.click()}
                    >
                      📷
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button style={styles.submitButton} onClick={validator}>
                  نشر
                </button>
              </div>
            </div>

            {showImageToast && (
              <div
                style={styles.toast}
                onAnimationEnd={handleImageToastDismiss}
              >
                <div style={styles.toastDanger}>
                  يجب عليك إدخال صورة على الأقل
                </div>
              </div>
            )}

            {showContentToast && (
              <div
                style={styles.toast}
                onAnimationEnd={handleContentToastDismiss}
              >
                <div style={styles.toastDanger}>يجب عليك إدخال جميع الحقول</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden",
  },
  content: {
    padding: "16px",
    flex: 1,
    overflow: "auto",
  },
  grid: {
    display: "flex",
    justifyContent: "center",
  },
  formColumn: {
    width: "100%",
    maxWidth: "800px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formItem: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "8px",
  },
  formLabel: {
    color: "#ff9800",
    fontSize: "14px",
    marginBottom: "8px",
  },
  formInput: {
    padding: "8px",
    fontSize: "16px",
    border: "none",
    outline: "none",
  },
  formTextarea: {
    padding: "8px",
    fontSize: "16px",
    minHeight: "100px",
    border: "none",
    outline: "none",
    resize: "vertical",
  },
  stepsLabel: {
    margin: "16px 0",
    fontSize: "16px",
  },
  editorContainer: {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "16px",
    marginBottom: "16px",
  },
  photoUpload: {
    cursor: "pointer",
    padding: "12px",
    borderBottom: "none",
  },
  photoContainer: {
    marginBottom: "16px",
    minHeight: "200px",
  },
  postImage: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    cursor: "pointer",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    border: "2px dashed #ddd",
    borderRadius: "4px",
  },
  imagesIcon: {
    fontSize: "48px",
    color: "#3880ff",
    cursor: "pointer",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    margin: "16px 0",
    backgroundColor: "#3880ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
  alert: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  alertContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    width: "80%",
    maxWidth: "400px",
    position: "relative",
  },
  alertHeader: {
    margin: "0 0 16px 0",
    textAlign: "center",
  },
  alertMessage: {
    margin: "0 0 20px 0",
    textAlign: "center",
  },
  alertButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#3880ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    animation: "fadeOut 1.5s forwards",
  },
  toastDanger: {
    backgroundColor: "#eb445a",
    color: "white",
    padding: "12px 16px",
    borderRadius: "4px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  "@keyframes fadeOut": {
    "0%": { opacity: 1 },
    "80%": { opacity: 1 },
    "100%": { opacity: 0 },
  },
};

export default CreatePost;
