import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Menu from './components/Menu/Menu';
import { AuthContext } from './context/AuthContext';
import AuthContextProvider from './context/AuthContext';
import Profile from './pages/profile.jsx'; // Import the Profile component
import MyPosts from './pages/myPosts.jsx'; // Import the My Posts component
import CreatePost from './pages/createPost.jsx'; // Import the Create Post component
import GetALlPosts from './pages/getAllPosts.jsx'; // Import the Get All Posts component
import UpdatePost from './pages/updatePost.jsx'; // Import the Update Post component
import GetPost from './pages/getPost.jsx'; // Import the Get Post component
import NotFound from './pages/notFound.jsx'; // Import the NotFound component

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { loggedIn, jwt } = useContext(AuthContext);
  const location = useLocation();
  
  if (!loggedIn || !jwt) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Wrapper component to handle layout based on route
const AppContent = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show menu on login or register pages
  const hideMenu = path === '/account/login' || path === '/account/register';
  
  // Check if we're on a post detail page
  const isPostDetail = path.match(/^\/posts\/[a-zA-Z0-9]+$/);
  
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {!hideMenu && <Menu />}
      <div style={{ 
        flex: 1, 
        width: isPostDetail ? '100%' : 'calc(100vw - 260px)', 
        marginLeft: hideMenu ? '0' : (isPostDetail ? '0' : '260px'),
        height: '100vh',
        overflow: 'auto',
        position: 'relative' // Added to ensure proper stacking context
      }}>
        <Routes>
          {/* Public routes */}
          <Route path="/account/register" element={<Register />} />
          <Route path="/account/login" element={<Login />} />
          <Route path="/posts" element={<GetALlPosts />} />
          <Route path="/posts/:id" element={<GetPost />} />
          
          {/* Protected routes */}
          <Route path="/account/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-posts" element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          } />
          <Route path="/my-posts/:id" element={
            <ProtectedRoute>
              <UpdatePost />
            </ProtectedRoute>
          } />
          <Route path="/create-post" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/posts" />} />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <AuthContextProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthContextProvider>
);

export default App;