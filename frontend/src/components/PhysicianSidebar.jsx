import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PhysicianSidebar() {
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
    const isActive = location.pathname === path;
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
    const isActive = location.pathname === path;
    if (!isActive) {
      e.target.style.backgroundColor = "transparent";
    } else {
      e.target.style.backgroundColor = "#99ccff";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("physicianToken");
    navigate("/");
  };

  return (
    <div style={sidebarStyle}>
      <div style={sectionTitleStyle}>Physician</div>

      <nav style={navStyle}>
        <button
          style={getButtonStyle("/physiciandashboard")}
          data-path="/physiciandashboard"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/physiciandashboard")}
        >
          Dashboard
        </button>

        <button
          style={getButtonStyle("/physician/appointmentList")}
          data-path="/physician/appointmentList"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/physician/appointmentList")}
        >
          Appointment List
        </button>

        <button
          style={getButtonStyle("/physician/patientList")}
          data-path="/physician/patientList"
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          onClick={() => navigate("/physician/patientList")}
        >
          Patients
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
