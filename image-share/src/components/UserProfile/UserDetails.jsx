import { useState, useEffect } from "react";

const UserDetails = (props) => {
  const [name, setName] = useState(props.name);
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showPassToast, setShowPassToast] = useState(false);

  const handleClick = () => {
    if (name && password) {
      if (password.length < 5) {
        setShowPassToast(true);
      } else {
        props.userName(name);
        props.password(password);
        props.showAlert(true);
      }
    } else {
      setShowToast(true);
    }
  };

  // Styles
  const listStyle = {
    padding: "16px",
    margin: 0,
    listStyle: "none",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  };

  const itemStyle = {
    marginBottom: "16px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    paddingBottom: "8px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#f49c29", // warning color similar to Ionic
    fontWeight: 500,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: "#f5f5f5",
    color: "#888",
    cursor: "not-allowed",
  };

  const buttonContainerStyle = {
    marginTop: "24px",
    marginBottom: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: disabled ? "#b4c9e8" : "#3880ff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const toastStyle = {
    position: "fixed",
    bottom: showToast || showPassToast ? "20px" : "-100px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#eb445a",
    color: "white",
    padding: "12px 24px",
    borderRadius: "4px",
    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
    transition: "bottom 0.3s ease-in-out",
    zIndex: 1000,
    textAlign: "center",
    maxWidth: "90%",
  };

  // Handle toast auto-dismiss
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    let timer;
    if (showPassToast) {
      timer = setTimeout(() => {
        setShowPassToast(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [showPassToast]);

  return (
    <div style={listStyle}>
      <div style={itemStyle}>
        <label style={labelStyle}>الاسم</label>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div style={itemStyle}>
        <label style={labelStyle}>البريد الإلكتروني</label>
        <input style={disabledInputStyle} value={props.email} disabled />
      </div>
      <div style={itemStyle}>
        <label style={labelStyle}>كلمة المرور</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setDisabled(false);
          }}
        />
      </div>
      <div style={buttonContainerStyle}>
        <button style={buttonStyle} onClick={handleClick} disabled={disabled}>
          تعديل البيانات
        </button>
      </div>

      {/* Toast Messages */}
      <div style={{ ...toastStyle, bottom: showToast ? "20px" : "-100px" }}>
        يجب عليك إدخال جميع الحقول
      </div>

      <div style={{ ...toastStyle, bottom: showPassToast ? "20px" : "-100px" }}>
        يجب عليك إدخال أكثر من خمسة محارف لكلمة المرور
      </div>
    </div>
  );
};

export default UserDetails;
