import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyle = {
    width: "240px",
    backgroundColor: "#cce5ff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "Arial, sans-serif",
    height: "100vh",
  };

  const sectionTitleStyle = {
    fontWeight: "bold",
    borderBottom: "1px solid #333",
    paddingBottom: "5px",
    fontSize: "16px",
  };

  const navStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  };

  const getButtonStyle = (path) => {
    const isActive = location.pathname === path || 
                     (path === "/patient/dashboard" && location.pathname === "/patientdashboard");
    return {
      background: isActive ? "#99ccff" : "none",
      border: "none",
      padding: "10px 0",
      textAlign: "left",
      cursor: "pointer",
      fontSize: "16px",
      borderRadius: "4px",
      transition: "background-color 0.2s",
      fontWeight: isActive ? "600" : "normal",
    };
  };

  const buttonHover = e => {
    if (!e.target.style.background || e.target.style.background === "none" || e.target.style.background === "transparent") {
      e.target.style.backgroundColor = "#99ccff";
    }
  };

  const buttonLeave = e => {
    const path = e.target.getAttribute("data-path");
    const isActive = location.pathname === path || 
                     (path === "/patient/dashboard" && location.pathname === "/patientdashboard");
    if (!isActive) {
      e.target.style.backgroundColor = "transparent";
    } else {
      e.target.style.backgroundColor = "#99ccff";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={sidebarStyle}>
      <div style={sectionTitleStyle}>Patient</div>

      <nav style={navStyle}>
        <button
          style={getButtonStyle("/patient/dashboard")}
          data-path="/patient/dashboard"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patient/dashboard")}
        >
          Dashboard
        </button>

        <button
          style={getButtonStyle("/patient/healthRecord")}
          data-path="/patient/healthRecord"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patient/healthRecord")}
        >
          Health Record
        </button>

        <button
          style={getButtonStyle("/patient/activitylog")}
          data-path="/patient/activitylog"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patient/activitylog")}
        >
          Activity Log
        </button>

        <button
          style={{ 
            background: "none",
            border: "none",
            padding: "10px 0",
            textAlign: "left",
            cursor: "pointer",
            fontSize: "16px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
            marginTop: "20px",
            color: "red"
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
