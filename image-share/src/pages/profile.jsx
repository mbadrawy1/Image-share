import React, { useContext, useEffect, useState } from "react";
import axios from "../config/axios";
import { PROFILE_URL, PROFILE_UPDATE_URL } from "../config/urls";
import { AuthContext } from "../context/AuthContext.jsx";
import Header from "../components/Header/Header.jsx";
import UserDetails from "../components/UserProfile/UserDetails.jsx";
import UserAvatar from "../components/UserProfile/UserAvatar.jsx";

const Profile = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [userImg, setUserImg] = useState();
  const [password, setPassword] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [blobUrl, setBlobUrl] = useState();
  const { jwt } = useContext(AuthContext);

  useEffect(() => {
    getProfile();
  }, [blobUrl]);

  const getProfile = async () => {
    setShowLoading(true);
    try {
      const res = await axios.get(PROFILE_URL, {
        headers: { Authorization: jwt },
      });
      setName(res.data.name);
      setEmail(res.data.email);
      setUserImg(res.data.img_uri);
      setShowLoading(false);
    } catch (e) {
      console.log(e.response);
      setShowLoading(false);
    }
  };

  const onSubmit = async () => {
    setShowLoading(true);
    const updateForm = { name, password };
    try {
      await axios.put(PROFILE_UPDATE_URL, updateForm, {
        headers: { Authorization: jwt },
      });
      setShowLoading(false);
    } catch (e) {
      console.log(e.response);
      setShowLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Loading Overlay */}
      {showLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            جاري التحميل...
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>تنبيه!</h3>
            <p style={{ marginBottom: "24px" }}>
              هل تريد بالفعل تعديل البيانات الشخصية؟
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#007bff",
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={() => {
                  onSubmit();
                  setShowAlert(false);
                }}
              >
                موافق
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={() => setShowAlert(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Header headerTitle="صفحة المستخدم" />

      <main
        style={{
          flex: 1,
          padding: "16px",
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <UserAvatar userImg={userImg} imgUri={setBlobUrl} />
            <UserDetails
              name={name}
              email={email}
              userName={setName}
              password={setPassword}
              showAlert={setShowAlert}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
