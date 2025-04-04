import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../config/axios";
import { GET_MY_POSTS } from "../config/urls";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header/Header";
import Loading from "../components/UI/Loading";
import Alert from "../components/UI/Alert";
import "../pages/myPosts.css"; // Import shared CSS

const UpdatePost = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { jwt } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!jwt) {
      navigate("/account/login");
      return;
    }
    getPost();
  }, [jwt]);

  const validator = () => {
    if (title && contents) {
      setShowAlert(true);
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const getPost = async () => {
    setShowLoading(true);
    setError(null);
    try {
      console.log("Fetching post with ID:", id);
      const res = await axios.get(GET_MY_POSTS + "/" + id, {
        headers: {
          Authorization: jwt,
        },
      });
      console.log("Post data received:", res.data);
      setTitle(res.data.title);
      setContents(res.data.contents);
    } catch (e) {
      console.error("Error fetching post:", e.response || e.message);
      setError("حدث خطأ أثناء تحميل المنشور");
    } finally {
      setShowLoading(false);
    }
  };

  const onSubmit = async () => {
    setShowLoading(true);
    setError(null);
    setSuccess(false);
    
    const postForm = {
      title,
      contents,
      steps: null
    };
    
    try {
      console.log("Updating post with ID:", id);
      console.log("Update data:", postForm);
      
      const updateRes = await axios.put(GET_MY_POSTS + "/" + id + "/update", postForm, {
        headers: {
          Authorization: jwt,
        },
      });
      
      console.log("Update response:", updateRes.data);
      
      // Show success message temporarily
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/my-posts", { state: { refresh: true } });
      }, 1500);
    } catch (e) {
      console.error("Error updating post:", e.response || e.message);
      setError("حدث خطأ أثناء تعديل المنشور");
      setShowLoading(false);
    }
  };

  return (
    <div className="page">
      <Loading show={showLoading} />

      <Alert
        show={showAlert}
        title="تنبيه!"
        message="هل تود بالفعل تعديل المنشور"
        confirmText="نعم"
        cancelText="إلغاء"
        onConfirm={() => {
          setShowAlert(false);
          onSubmit();
        }}
        onCancel={() => setShowAlert(false)}
      />

      <Header headerTitle="تعديل المنشور" defaultHref="/my-posts" />

      <div className="content">
        {error && (
          <div style={{
            backgroundColor: '#ffeded',
            border: '1px solid #ff5252',
            color: '#d32f2f',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            direction: 'rtl'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #28a745',
            color: '#155724',
            padding: '10px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            direction: 'rtl'
          }}>
            تم تعديل المنشور بنجاح
          </div>
        )}

        {showToast && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <p>يجب عليك إدخال جميع الحقول</p>
          </div>
        )}

        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              العنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              الوصف
            </label>
            <textarea
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                minHeight: "100px",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={validator}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              تعديل المنشور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePost;
