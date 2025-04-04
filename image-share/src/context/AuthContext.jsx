import { createContext, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [jwt, setJwt] = useState();
    const [guestMode, setGuestMode] = useState(false);

    useEffect(() => {
        getAuthenticated();
    }, []);

    const getAuthenticated = async () => {
        setShowLoading(true);
        try {
            // First try to get from localStorage (for web)
            const localToken = localStorage.getItem('accessToken');
            
            if (localToken && localToken !== 'null' && localToken !== 'undefined') {
                console.log("Found token in localStorage");
                setLoggedIn(true);
                setJwt(localToken);
                setGuestMode(false);
                setShowLoading(false);
                return;
            }
            
            // If not in localStorage, try Capacitor Preferences (for mobile)
            const accessToken = await Preferences.get({ key: 'accessToken' });
            if (accessToken.value && accessToken.value !== 'null' && accessToken.value !== 'undefined') {
                console.log("Found token in Preferences");
                // Also set in localStorage for consistency
                localStorage.setItem('accessToken', accessToken.value);
                setLoggedIn(true);
                setJwt(accessToken.value);
                setGuestMode(false);
            } else {
                console.log("No valid token found, entering guest mode");
                setLoggedIn(false);
                setGuestMode(true);
                // Clear any invalid tokens
                localStorage.removeItem('accessToken');
                await Preferences.remove({ key: 'accessToken' });
            }
        } catch (error) {
            console.error("Auth error:", error);
            setLoggedIn(false);
            setGuestMode(true);
            // Clear on error
            localStorage.removeItem('accessToken');
            await Preferences.remove({ key: 'accessToken' });
        } finally {
            setShowLoading(false);
        }
    };

    // Loading spinner styles
    const loadingContainerStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 9999
    };

    const spinnerStyle = {
        width: "48px",
        height: "48px",
        border: "4px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        borderTop: "4px solid #3880ff",
        animation: "spin 1s linear infinite"
    };

    // Define the keyframes animation in a style tag
    const keyframesStyle = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <>
            {/* Add the keyframes animation */}
            <style>{keyframesStyle}</style>
            
            {showLoading ? (
                <div style={loadingContainerStyle}>
                    <div style={spinnerStyle}></div>
                </div>
            ) : (
                <AuthContext.Provider value={{ loggedIn, setLoggedIn, jwt, setJwt, guestMode, setGuestMode }}>
                    {props.children}
                </AuthContext.Provider>
            )}
        </>
    );
};

export default AuthContextProvider;