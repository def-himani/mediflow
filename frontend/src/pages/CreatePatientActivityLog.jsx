import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/PatientSidebar";
import { createPatientActivityLog } from "../services/api";

export default function CreatePatientActivityLog() {
  const navigate = useNavigate();
  const [logDate, setLogDate] = useState("");
  const [weight, setWeight] = useState("");
  const [bp, setBp] = useState("");
  const [calories, setCalories] = useState("");
  const [activityDuration, setActivityDuration] = useState("");

  const isFormValid = () => {
    return logDate;
  };

  const handleCreate = async () => {
    if (!isFormValid()) {
      alert("Please fill in Log Date.");
      return;
    }

    const payload = {
      log_date: logDate,
      weight: weight || null,
      bp: bp || null,
      calories: calories || null,
      duration_of_physical_activity: activityDuration || null,
    };

    try {
      const response = await createPatientActivityLog(payload);
      if (response.data.success) {
        alert("Activity log created successfully!");
        navigate("/patient/activity-log");
      } else {
        alert(response.data.message || "Error creating activity log");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error creating activity log"
      );
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#f0f0f0",
    },
    main: {
      flex: 1,
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      overflowY: "auto",
    },
    card: {
      backgroundColor: "#e6f0ff",
      borderRadius: "8px",
      padding: "24px",
      maxWidth: "600px",
      margin: "0 auto",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    field: {
      backgroundColor: "#e0e0e0",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      width: "100%",
      marginBottom: "16px",
      fontSize: "14px",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "8px",
      display: "block",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginTop: "20px",
    },
    button: {
      padding: "10px 18px",
      backgroundColor: "#4a90e2",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      flex: 1,
    },
    cancelButton: {
      padding: "10px 18px",
      backgroundColor: "#999",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      flex: 1,
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1>Log Your Daily Activity</h1>
        <div style={styles.card}>
          <div>
            <label style={styles.label}>Date *</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              style={styles.field}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={styles.field}
              placeholder="e.g., 70.5"
            />
          </div>

          <div>
            <label style={styles.label}>Blood Pressure</label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              style={styles.field}
              placeholder="e.g., 120/80"
            />
          </div>

          <div>
            <label style={styles.label}>Calories Consumed</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              style={styles.field}
              placeholder="e.g., 2000"
            />
          </div>

          <div>
            <label style={styles.label}>Physical Activity Duration (minutes)</label>
            <input
              type="number"
              value={activityDuration}
              onChange={(e) => setActivityDuration(e.target.value)}
              style={styles.field}
              placeholder="e.g., 30"
            />
          </div>

          <div style={styles.buttonContainer}>
            <button
              onClick={handleCreate}
              style={styles.button}
              disabled={!isFormValid()}
            >
              Create Log
            </button>
            <button
              onClick={() => navigate("/patient/activity-log")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
