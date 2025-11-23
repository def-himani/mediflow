import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/PatientSidebar";
import { getPatientActivityLogs } from "../services/api";
import { useNavigate } from "react-router-dom";

const Card = ({ children }) => (
  <div
    style={{
      backgroundColor: "#e6f0ff",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
  >
    {children}
  </div>
);

export default function PatientActivityLog() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    filterActivityLogs();
  }, [filterType, activityLogs]);

  const fetchActivityLogs = async () => {
    try {
      const response = await getPatientActivityLogs();
      if (response.data.success) {
        setActivityLogs(response.data.activity_logs || []);
        setFilteredLogs(response.data.activity_logs || []);
      } else {
        setError(response.data.message || "Failed to fetch activity logs");
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError("Error loading activity logs");
    } finally {
      setLoading(false);
    }
  };

  const filterActivityLogs = () => {
    if (filterType === "all") {
      setFilteredLogs(activityLogs);
    } else {
      setFilteredLogs(
        activityLogs.filter((log) => log.activity_type === filterType)
      );
    }
  };

  const handleViewDetail = (logId) => {
    navigate(`/patient/activity-log/${logId}`);
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
      marginBottom: "20px",
    },
    filterContainer: {
      marginBottom: "20px",
    },
    select: {
      backgroundColor: "#e0e0e0",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      cursor: "pointer",
      fontSize: "14px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    th: {
      backgroundColor: "#4a90e2",
      color: "white",
      padding: "12px",
      textAlign: "left",
      fontWeight: "bold",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #e0e0e0",
    },
    viewButton: {
      padding: "6px 12px",
      backgroundColor: "#4a90e2",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
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
        <div style={styles.header}>
          <h1>My Activity Logs</h1>
          <p style={{ color: "#666", marginTop: "8px" }}>
            View your medical activity history and healthcare interactions
          </p>
        </div>

        <div style={styles.filterContainer}>
          <label style={{ marginRight: "12px", fontWeight: "bold" }}>
            Filter by Type:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Types</option>
            <option value="visit">Visit</option>
            <option value="medication_change">Medication Change</option>
            <option value="test_result">Test Result</option>
            <option value="consultation">Consultation</option>
            <option value="follow_up">Follow Up</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading && (
          <Card>
            <p>Loading activity logs...</p>
          </Card>
        )}

        {error && (
          <Card>
            <p style={{ color: "red" }}>{error}</p>
          </Card>
        )}

        {!loading && !error && filteredLogs.length === 0 && (
          <Card>
            <p>No activity logs found.</p>
          </Card>
        )}

        {!loading && !error && filteredLogs.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Physician</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.activity_id}>
                  <td style={styles.td}>{log.activity_date}</td>
                  <td style={styles.td}>{log.activity_type}</td>
                  <td style={styles.td}>
                    {log.activity_description?.substring(0, 60)}
                    {log.activity_description?.length > 60 ? "..." : ""}
                  </td>
                  <td style={styles.td}>{log.physician_name || "N/A"}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewButton}
                      onClick={() => handleViewDetail(log.activity_id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
