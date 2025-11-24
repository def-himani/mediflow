import React, { useState } from "react";
import Sidebar from "../components/PatientSidebar";
import { useNavigate } from "react-router-dom";
import { createActivityLog } from "../services/api";

export default function NewActivity() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    bp_systolic: "",
    bp_diastolic: "",
    calories: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate("/patient/activitylog");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await createActivityLog({
        date: formData.date,
        weight: parseFloat(formData.weight),
        bp_systolic: parseInt(formData.bp_systolic),
        bp_diastolic: parseInt(formData.bp_diastolic),
        calories: parseInt(formData.calories),
        duration: parseInt(formData.duration),
      });
      
      if (res.status === 201 || res.status === 200) {
        navigate("/patient/activitylog");
      } else {
        setError("Failed to save activity log");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error saving activity log");
    } finally {
      setLoading(false);
    }
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
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#333",
      marginBottom: "30px",
      margin: 0,
    },
    formCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "30px",
      maxWidth: "600px",
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
    input: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
    },
    bpContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
    },
    textarea: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      minHeight: "120px",
      resize: "vertical",
    },
    buttonContainer: {
      display: "flex",
      gap: "15px",
      justifyContent: "flex-end",
      marginTop: "30px",
    },
    cancelButton: {
      padding: "10px 25px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      backgroundColor: "#f5f5f5",
      color: "#333",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    },
    saveButton: {
      padding: "10px 25px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>New Activity</h1>

        {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

        <div style={styles.formCard}>
          {/* Date */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Weight */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Weight (lb)</label>
            <input
              type="number"
              name="weight"
              placeholder="Enter weight"
              value={formData.weight}
              onChange={handleChange}
              style={styles.input}
              step="0.01"
            />
          </div>

          {/* Blood Pressure */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Blood Pressure</label>
            <div style={styles.bpContainer}>
              <input
                type="number"
                name="bp_systolic"
                placeholder="Systolic"
                value={formData.bp_systolic}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="number"
                name="bp_diastolic"
                placeholder="Diastolic"
                value={formData.bp_diastolic}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Calories */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Calories Consumed</label>
            <input
              type="number"
              name="calories"
              placeholder="Enter calories"
              value={formData.calories}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Physical Activity Duration */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Physical Activity Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              placeholder="Enter duration"
              value={formData.duration}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttonContainer}>
            <button style={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button style={styles.saveButton} onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
