import React, { useState, useEffect } from "react";
import Sidebar from "../components/PhysicianSidebar";
import { useNavigate, useParams } from "react-router-dom";
import { physicianPatientActivityLog } from "../services/api";

export default function PhysicianViewActivityLog() {
  const { patientId, logId } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        const response = await physicianPatientActivityLog(patientId, logId);
        
        if (response.data.success && response.data.log) {
          setLog(response.data.log);
        } else {
          setError("Failed to fetch activity log");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching activity log");
        console.error("Error fetching activity log:", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId && logId) {
      fetchActivityLog();
    }
  }, [patientId, logId]);

  const handleBack = () => {
    navigate(-1);
  };

  const styles = {
    container: { display: "flex", height: "100vh" },
    main: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#f5f7fa",
      fontFamily: "Arial, sans-serif",
      overflow: "auto",
    },
    header: {
      marginBottom: "30px",
    },
    dateDisplay: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#333",
      margin: 0,
    },
    backButton: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      background: "#6c757d",
      color: "white",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      marginBottom: "15px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "30px",
      maxWidth: "600px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#333",
      marginBottom: "15px",
      marginTop: "0",
    },
    formGroup: {
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "8px",
    },
    value: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
    },
    bpContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <p>Loading activity log...</p>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <p style={{ color: "red" }}>Activity log not found</p>
          <button style={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const [systolic, diastolic] = log.bp.split("/");

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <button style={styles.backButton} onClick={handleBack}>
          Back
        </button>

        <div style={styles.header}>
          <h1 style={styles.dateDisplay}>{log.log_date}</h1>
        </div>

        {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

        <div style={styles.card}>
          {/* Weight */}
          <h3 style={styles.sectionTitle}>Weight (lb)</h3>
          <div style={styles.formGroup}>
            <div style={styles.value}>{log.weight}</div>
          </div>

          {/* Blood Pressure */}
          <h3 style={styles.sectionTitle}>Blood Pressure</h3>
          <div style={styles.formGroup}>
            <div style={styles.bpContainer}>
              <div style={styles.value}>{systolic} (Systolic)</div>
              <div style={styles.value}>{diastolic} (Diastolic)</div>
            </div>
          </div>

          {/* Calories */}
          <h3 style={styles.sectionTitle}>Calories Consumed</h3>
          <div style={styles.formGroup}>
            <div style={styles.value}>{log.calories}</div>
          </div>

          {/* Physical Activity Duration */}
          <h3 style={styles.sectionTitle}>Physical Activity Duration (minutes)</h3>
          <div style={styles.formGroup}>
            <div style={styles.value}>{log.duration_of_physical_activity}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
