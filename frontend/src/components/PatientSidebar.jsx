import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

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
  };

  const navStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    padding: "10px 0",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  };

  const buttonHover = e => {
    e.target.style.backgroundColor = "#99ccff";
  };

  const buttonLeave = e => {
    e.target.style.backgroundColor = "transparent";
  };

  return (
    <div style={sidebarStyle}>
      <h1 style={{ fontSize: "24px", margin: 0 }}>MediFlow</h1>

      <div style={sectionTitleStyle}>Patient</div>

      <nav style={navStyle}>
        <button
          style={buttonStyle}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patientdashboard")}
        >
          Dashboard
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patient/healthRecord")}
        >
          Health Record
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/patient/activityLog")}
        >
          Activity Log
        </button>
      </nav>
    </div>
  );
}
