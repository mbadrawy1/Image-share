import React, { useState, useContext } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "../config/axios";
import { REGISTER_URL, LOGIN_URL } from "../config/urls";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import { Preferences } from "@capacitor/preferences";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const navigate = useNavigate();
  const { setLoggedIn, setJwt, setGuestMode } = useContext(AuthContext);

  const validationSchema = yup.object({
    name: yup.string().nullable().required("يجب عليك إدخال اسم المستخدم"),
    email: yup
      .string()
      .nullable()
      .email("يجب عليك إدخال بريد إلكتروني صحيح")
      .required("يجب عليك إدخال البريد الإلكتروني"),
    password: yup
      .string()
      .nullable()
      .min(5, "يجب عليك إدخال 5 محارف على الأقل")
      .required("يجب عليك إدخال كلمة مرور"),
    confirmPassword: yup
      .string()
      .nullable()
      .oneOf([yup.ref('password'), null], "كلمة المرور غير متطابقة")
      .required("يجب عليك تأكيد كلمة المرور"),
  });

  const onSubmit = async (values) => {
    setShowLoading(true);
    try {
      // Register the user
      const registerResponse = await axios.post(REGISTER_URL, {
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      console.log("Registration successful:", registerResponse.data);
      
      // Automatically log the user in
      const loginResponse = await axios.post(LOGIN_URL, {
        email: values.email,
        password: values.password
      });
      
      console.log("Auto login successful:", loginResponse.data);
      
      // Store the token
      const token = loginResponse.data.accessToken;
      await Preferences.set({ key: "accessToken", value: token });
      localStorage.setItem("accessToken", token);
      
      // Update auth context
      setLoggedIn(true);
      setJwt(token);
      setGuestMode(false);
      
      // Navigate to posts page
      navigate("/posts");
    } catch (e) {
      if (e.response && e.response.status === 400) {
        setShowLoading(false);
        setShowErrorAlert(true);
      } else {
        console.log(e.message);
        setShowLoading(false);
      }
    }
  };

  return (
    <div style={{ 
      fontFamily: "Arial, sans-serif", 
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
    }}>
      <Header headerTitle="تسجيل مستخدم جديد" />
      
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#f5f5f5", width: "100%", boxSizing: "border-box" }}>
        {showLoading && <div style={{ textAlign: "center" }}>Loading...</div>}

        {showAlert && (
          <div
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <h4>تنبيه!</h4>
            <p>
              لقد تم تسجيل حسابك بالفعل. يمكنك الانتقال إلى صفحة تسجيل الدخول.
            </p>
            <button
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/account/login")}
            >
              موافق
            </button>
          </div>
        )}

        {showErrorAlert && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <h4>تنبيه!</h4>
            <p>هذا البريد الإلكتروني مستخدم بالفعل. هل ترغب بتسجيل الدخول؟</p>
            <button
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
              onClick={() => navigate("/account/login")}
            >
              موافق
            </button>
            <button
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setShowErrorAlert(false)}
            >
              إلغاء
            </button>
          </div>
        )}

        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: ""
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              onSubmit(values);
              resetForm({ values: "" });
            }}
          >
            {(formikProps) => (
              <form onSubmit={formikProps.handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formikProps.values.name}
                    onChange={formikProps.handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                  {formikProps.touched.name && formikProps.errors.name && (
                    <div style={{ color: "red", marginTop: "5px" }}>
                      {formikProps.errors.name}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formikProps.values.email}
                    onChange={formikProps.handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                  {formikProps.touched.email && formikProps.errors.email && (
                    <div style={{ color: "red", marginTop: "5px" }}>
                      {formikProps.errors.email}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formikProps.values.password}
                    onChange={formikProps.handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                  {formikProps.touched.password &&
                    formikProps.errors.password && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        {formikProps.errors.password}
                      </div>
                    )}
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formikProps.values.confirmPassword}
                    onChange={formikProps.handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                  {formikProps.touched.confirmPassword &&
                    formikProps.errors.confirmPassword && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        {formikProps.errors.confirmPassword}
                      </div>
                    )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    إنشاء حساب
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/account/login")}
                    style={{
                      backgroundColor: "transparent",
                      color: "#007bff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;