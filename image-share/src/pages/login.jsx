import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import Header from "../components/Header/Header";
import axios from "../config/axios";
import { LOGIN_URL } from "../config/urls";
import { Preferences } from "@capacitor/preferences";

// AuthContext is assumed to be defined elsewhere
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { setLoggedIn, setJwt, setGuestMode } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async () => {
    setShowLoading(true);
    setShowAlert(false);
    
    if (!email || !password) {
      setErrorMessage("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      setShowAlert(true);
      setShowLoading(false);
      return;
    }
    
    const logInForm = {
      email,
      password,
    };
  
    console.log("Attempting login with:", { email });
    
    try {
      const res = await axios.post(LOGIN_URL, logInForm);
      console.log("Login successful, response:", res.data);
      
      // Ensure accessToken exists in the response
      if (!res.data.accessToken) {
        console.error("No accessToken in response", res.data);
        setErrorMessage("خطأ في الاستجابة من الخادم");
        setShowAlert(true);
        setShowLoading(false);
        return;
      }
      
      // Store token in Preferences for mobile
      await Preferences.set({ key: "accessToken", value: res.data.accessToken });
      // Also store in localStorage for web
      localStorage.setItem("accessToken", res.data.accessToken);
      
      setLoggedIn(true);
      setJwt(res.data.accessToken); // Update AuthContext
      setGuestMode(false);
      
      console.log("Redirecting after successful login");
      
      // Check if we have a stored location to return to
      const { from } = location.state || { from: { pathname: "/posts" } };
      navigate(from.pathname);
    } catch (e) {
      console.error("Login error details:", e);
      
      if (e.response) {
        console.error("Server response error:", e.response.status, e.response.data);
        setErrorMessage(e.response.data.message || "البريد الإلكتروني أو كلمة المرور غير صحيح");
      } else if (e.request) {
        console.error("No response received:", e.request);
        setErrorMessage("لا يمكن الاتصال بالخادم");
      } else {
        console.error("Request setup error:", e.message);
        setErrorMessage("حدث خطأ أثناء تسجيل الدخول");
      }
      
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const styles = {
    page: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
    },
    content: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#f5f5f5",
      width: "100%",
      boxSizing: "border-box",
    },
    grid: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
    column: {
      width: "100%",
      maxWidth: "500px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    icon: {
      fontSize: "48px",
      color: "#eb9834",
      margin: "20px 0",
    },
    list: {
      width: "100%",
      listStyle: "none",
      padding: 0,
    },
    item: {
      marginBottom: "20px",
      width: "100%",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "bold",
      color: "#eb9834",
      textAlign: "right",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "16px",
      direction: "rtl",
    },
    passwordInput: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "16px",
      direction: "rtl",
    },
    buttonContainer: {
      textAlign: "center",
      marginTop: "20px",
      width: "100%",
    },
    button: {
      backgroundColor: "#eb9834",
      color: "white",
      border: "none",
      padding: "12px 30px",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    link: {
      display: "block",
      marginTop: "15px",
      color: "#eb9834",
      textDecoration: "none",
      fontSize: "14px",
    },
    loadingOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "5px solid #f3f3f3",
      borderTop: "5px solid #eb9834",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    alert: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 20px rgba(0, 0, 0, 0.2)",
      zIndex: 1001,
      textAlign: "center",
      width: "300px",
    },
    alertHeader: {
      margin: "0 0 10px 0",
      color: "#eb9834",
      fontSize: "18px",
      fontWeight: "bold",
    },
    alertMessage: {
      margin: "15px 0",
      fontSize: "14px",
      direction: "rtl",
    },
    alertButton: {
      backgroundColor: "#eb9834",
      color: "white",
      border: "none",
      padding: "8px 20px",
      borderRadius: "4px",
      fontSize: "14px",
      cursor: "pointer",
    },
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  // Alert Component
  const Alert = ({ show, onClose, message }) => {
    if (!show) return null;

    return (
      <div style={styles.alert}>
        <h3 style={styles.alertHeader}>تنبيه!</h3>
        <p style={styles.alertMessage}>{message}</p>
        <button style={styles.alertButton} onClick={onClose}>
          موافق
        </button>
      </div>
    );
  };

  // Loading Component
  const Loading = ({ show }) => {
    if (!show) return null;

    return (
      <div style={styles.loadingOverlay}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Loading show={showLoading} />
      <Alert
        show={showAlert}
        onClose={() => setShowAlert(false)}
        message={errorMessage}
      />

      <Header headerTitle="تسجيل الدخول" />

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.column}>
            <div style={styles.icon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 512 512"
              >
                <path
                  d="M392,432H120a40,40,0,0,1-40-40V120a40,40,0,0,1,40-40H392a40,40,0,0,1,40,40V392A40,40,0,0,1,392,432Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
                <polyline
                  points="164 128 276 128 276 212"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
                <line
                  x1="336"
                  y1="128"
                  x2="336"
                  y2="336"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
                <line
                  x1="176"
                  y1="224"
                  x2="336"
                  y2="224"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
                <line
                  x1="176"
                  y1="336"
                  x2="264"
                  y2="336"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                />
              </svg>
            </div>

            <ul style={styles.list}>
              <li style={styles.item}>
                <label style={styles.label}>البريد الإلكتروني</label>
                <input
                  type="email"
                  style={styles.input}
                  value={email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </li>
              <li style={styles.item}>
                <label style={styles.label}>كلمة المرور</label>
                <input
                  type="password"
                  style={styles.passwordInput}
                  value={password || ""}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </li>
            </ul>

            <div style={styles.buttonContainer}>
              <button style={styles.button} onClick={onSubmit}>
                تسجيل الدخول
              </button>
              <a href="/account/register" style={styles.link}>
                تسجيل مستخدم
              </a>
              <button 
                onClick={() => {
                  setGuestMode(true);
                  navigate("/posts");
                }}
                style={{
                  backgroundColor: "transparent",
                  color: "#999999",
                  border: "none",
                  padding: "10px",
                  marginTop: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  textDecoration: "underline"
                }}
              >
                استمر كضيف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
