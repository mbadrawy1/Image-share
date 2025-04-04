import React from "react";

const NotFound = () => {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.toolbar}>
          <h1 style={styles.title}>الصفحة غير موجودة</h1>
        </div>
      </header>
      <main style={styles.content}>
        <div style={styles.container}>
          <p style={styles.text}>الصفحة المطلوبة غير موجودة</p>
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#f8f9fa",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  toolbar: {
    padding: "16px",
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "#2d3436",
  },
  content: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "16px",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    paddingTop: "2rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#636e72",
  },
};

export default NotFound;
