import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../../main";
import "./Navbar.css";

import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Dropdown menu visibility state
  const { isAuthenticated, setIsAuthenticated, user } = useContext(Context);
  const location = useLocation();
  const navigateTo = useNavigate();
  const { t, i18n } = useTranslation();
  const handleLogout = async () => {
    console.log("Starting logout process"); // Debug log
    
    try {
      // 1. Clear local storage first
      localStorage.clear();
      sessionStorage.clear();
      console.log("Local storage cleared"); // Debug log
  
      // 2. Make logout request
      await axios.post("http://localhost:4000/api/v1/user/logout", {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log("Server logout successful"); // Debug log
  
      // 3. Handle Google logout if necessary
      if (window.google?.accounts && user?.googleId) {
        window.google.accounts.id.disableAutoSelect();
        localStorage.removeItem("google_auth_token");
        console.log("Google logout completed"); // Debug log
      }
  
      // 4. Update state and redirect
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      navigateTo("/");
    } catch (error) {
      console.error("Logout error details:", error.response || error); // Detailed error logging
      
      // Even if server logout fails, ensure user is logged out locally
      setIsAuthenticated(false);
      toast.success("Logged out locally");
      navigateTo("/");
    }
  };
  
  // Effect to initialize Google One Tap if available
  useEffect(() => {
    // Initialize Google One Tap if it's loaded and we're authenticated
    if (window.google && window.google.accounts && isAuthenticated && user?.googleId) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
        callback: () => {}, // Empty callback as we're just using for sign-out
        
      });
      console.log("Navbar - User:", user);
      console.log("Navbar - isAuthenticated:", isAuthenticated);
    }
  }, [isAuthenticated, user]);

  const isHomePage = location.pathname === "/";
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible); // Toggle dropdown menu visibility
  };
  
  return (
    <nav className={`navbar ${isHomePage ? "transparent" : "blue"}`}>
      {/* Logo Section */}
      <div className="logo">
        <img src="/logo.png" alt="logo" className="logo-img" />
      </div>
      {/* Navigation Links */}
      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
        <Link to="/">{t("home")}</Link>
          <Link to="/appointment">{t("appointment")}</Link>
          <Link to="/departments">{t("departments")}</Link>
          <Link to="/contact">{t("contact")}</Link>
          <Link to="/about">{t("about")}</Link>
        </div>
      </div>
      {/* Auth Buttons */}
      <div className="authButtons">
        {isAuthenticated ? (
          <>
            {/* Profile Button with Menu Icon */}
            <div className="profile-btn" onClick={toggleMenu}>
              <div className="menu-icon">&#9776;</div> {/* Hamburger menu icon */}
              <div className={`dropdown-menu ${menuVisible ? "show" : ""}`}>
              <Link to="/profile">{t("profile")}</Link>
              <Link to="/settings">{t("settings")}</Link>
                <button className="logoutBtn btn" onClick={handleLogout}>LOGOUT</button>
              </div>
            </div>
          </>
        ) : (
          <>
          <button className="loginBtn btn" onClick={() =>navigateTo("/login")}>
          {t("login")}
</button>
<button className="signupBtn btn" onClick={() => navigateTo("/signup")}>
{t("signup")}

</button>

          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
