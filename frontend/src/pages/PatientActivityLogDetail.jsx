import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/PatientSidebar";
import { getActivityLogByIdPatient } from "../services/api";

const Card = ({ children, style }) => (
  <div
    style={{
      backgroundColor: "#e6f0ff",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      ...style,
    }}
  >
    {children}
  </div>
);

export default function PatientActivityLogDetail() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const [activityLog, setActivityLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivityLogDetail();
  }, [logId]);

  const fetchActivityLogDetail = async () => {
    try {
      const response = await getActivityLogByIdPatient(logId);
      if (response.data.success) {
        setActivityLog(response.data.activity_log);
      } else {
        setError(response.data.message || "Failed to fetch activity log");
      }
    } catch (err) {
      console.error("Error fetching activity log:", err);
      setError("Error loading activity log details");
    } finally {
      setLoading(false);
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
    header: {
      marginBottom: "24px",
    },
    backButton: {
      padding: "8px 16px",
      backgroundColor: "#999",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    detailGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "16px",
    },
    detailItem: {
      backgroundColor: "white",
      padding: "16px",
      borderRadius: "6px",
    },
    label: {
      fontWeight: "bold",
      color: "#666",
      fontSize: "12px",
      marginBottom: "6px",
      textTransform: "uppercase",
    },
    value: {
      fontSize: "16px",
      color: "#333",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    badge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "12px",
      backgroundColor: "#4a90e2",
      color: "white",
      fontSize: "14px",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.main}
      >
        <button
          onClick={() => navigate("/patient/activity-log")}
          style={styles.backButton}
        >
          ← Back to Activity Logs
        </button>

        {loading && (
          <Card>
            <p>Loading activity log details...</p>
          </Card>
        )}

        {error && (
          <Card>
            <p style={{ color: "red" }}>{error}</p>
          </Card>
        )}

        {!loading && !error && activityLog && (
          <>
            <div style={styles.header}>
              <h1>Activity Log Details</h1>
            </div>

            <Card>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.label}>Activity Date</div>
                  <div style={styles.value}>{activityLog.activity_date}</div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.label}>Activity Type</div>
                  <div style={styles.value}>
                    <span style={styles.badge}>{activityLog.activity_type}</span>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.label}>Physician</div>
                  <div style={styles.value}>
                    {activityLog.physician_name || "Not specified"}
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.label}>Created On</div>
                  <div style={styles.value}>{activityLog.created_at}</div>
                </div>

                <div style={{ ...styles.detailItem, ...styles.fullWidth }}>
                  <div style={styles.label}>Description</div>
                  <div style={styles.value}>{activityLog.activity_description}</div>
                </div>

                {activityLog.notes && (
                  <div style={{ ...styles.detailItem, ...styles.fullWidth }}>
                    <div style={styles.label}>Additional Notes</div>
                    <div style={styles.value}>{activityLog.notes}</div>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
}

