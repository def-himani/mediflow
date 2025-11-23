import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/PhysicianSidebar";
import { getActivityLogById, updateActivityLog } from "../services/api";

export default function EditActivityLog() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityType, setActivityType] = useState("visit");
  const [activityDescription, setActivityDescription] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchActivityLog();
  }, [logId]);

  const fetchActivityLog = async () => {
    try {
      const response = await getActivityLogById(logId);
      if (response.data.success) {
        const log = response.data.activity_log;
        setPatientId(log.patient_id);
        setPatientName(log.patient_name);
        setActivityDate(log.activity_date);
        setActivityType(log.activity_type);
        setActivityDescription(log.activity_description);
        setNotes(log.notes || "");
      } else {
        alert("Failed to load activity log");
        navigate("/physician/activity-log");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading activity log");
      navigate("/physician/activity-log");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return activityDate && activityType && activityDescription;
  };

  const handleUpdate = async () => {
    if (!isFormValid()) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      activity_date: activityDate,
      activity_type: activityType,
      activity_description: activityDescription,
      notes: notes || null,
    };

    try {
      const response = await updateActivityLog(logId, payload);
      if (response.data.success) {
        alert("Activity log updated successfully!");
        navigate("/physician/activity-log");
      } else {
        alert(response.data.message || "Error updating activity log");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error updating activity log"
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
    textarea: {
      backgroundColor: "#e0e0e0",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      width: "100%",
      minHeight: "100px",
      marginBottom: "16px",
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      resize: "vertical",
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
    infoText: {
      backgroundColor: "#fff",
      padding: "8px",
      borderRadius: "4px",
      marginBottom: "16px",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1>Edit Activity Log</h1>
        <div style={styles.card}>
          <div>
            <label style={styles.label}>Patient</label>
            <div style={styles.infoText}>
              {patientName} (ID: {patientId})
            </div>
          </div>

          <div>
            <label style={styles.label}>Activity Date *</label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              style={styles.field}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Activity Type *</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              style={styles.field}
              required
            >
              <option value="visit">Visit</option>
              <option value="medication_change">Medication Change</option>
              <option value="test_result">Test Result</option>
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow Up</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Activity Description *</label>
            <textarea
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Enter detailed description of the activity..."
              required
            />
          </div>

          <div>
            <label style={styles.label}>Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              placeholder="Any additional notes or observations..."
            />
          </div>

          <div style={styles.buttonContainer}>
            <button
              onClick={handleUpdate}
              style={styles.button}
              disabled={!isFormValid()}
            >
              Update Activity Log
            </button>
            <button
              onClick={() => navigate("/physician/activity-log")}
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
