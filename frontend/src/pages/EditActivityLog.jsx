import React, { useState, useEffect } from "react";
import Sidebar from "../components/PatientSidebar";
import { useNavigate, useParams } from "react-router-dom";
import { getActivityLog, updateActivityLog } from "../services/api";

export default function EditActivityLog() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    weight: "",
    bp_systolic: "",
    bp_diastolic: "",
    calories: "",
    duration: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        setLoading(true);
        const res = await getActivityLog(logId);
        if (res.status !== 200) throw new Error("Failed to fetch log");
        
        const log = res.data.log;
        const [systolic, diastolic] = log.bp.split("/");
        setFormData({
          date: log.log_date,
          weight: log.weight,
          bp_systolic: systolic,
          bp_diastolic: diastolic,
          calories: log.calories,
          duration: log.duration_of_physical_activity,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load activity log");
        setLoading(false);
      }
    };
    
    fetchLog();
  }, [logId]);

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

  const handleEdit = async () => {
    try {
      setIsSaving(true);
      const res = await updateActivityLog(logId, {
        weight: parseFloat(formData.weight),
        bp_systolic: parseInt(formData.bp_systolic),
        bp_diastolic: parseInt(formData.bp_diastolic),
        calories: parseInt(formData.calories),
        duration: parseInt(formData.duration),
      });
      
      if (res.status === 200) {
        navigate("/patient/activitylog");
      } else {
        setError("Failed to update activity log");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error updating activity log");
    } finally {
      setIsSaving(false);
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
    header: {
      marginBottom: "30px",
    },
    dateDisplay: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#333",
      margin: 0,
    },
    formCard: {
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
    input: {
      padding: "10px 12px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
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
      minHeight: "150px",
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
    editButton: {
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

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.dateDisplay}>{formData.date}</h1>
        </div>

        {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

        <div style={styles.formCard}>
          {/* Metrics Section */}
          <h3 style={styles.sectionTitle}>Weight (lb)</h3>
          <div style={styles.formGroup}>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              style={styles.input}
              step="0.01"
            />
          </div>

          <h3 style={styles.sectionTitle}>Blood Pressure</h3>
          <div style={styles.formGroup}>
            <div style={styles.bpContainer}>
              <input
                type="number"
                name="bp_systolic"
                value={formData.bp_systolic}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="number"
                name="bp_diastolic"
                value={formData.bp_diastolic}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Calories Consumed</h3>
          <div style={styles.formGroup}>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <h3 style={styles.sectionTitle}>Physical Activity Duration (minutes)</h3>
          <div style={styles.formGroup}>
            <input
              type="number"
              name="duration"
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
            <button style={styles.editButton} onClick={handleEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Edit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
