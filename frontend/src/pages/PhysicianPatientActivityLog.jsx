import React, { useState, useEffect } from "react";
import Sidebar from "../components/PhysicianSidebar";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { physicianPatientActivityLogs } from "../services/api";

export default function PhysicianPatientActivityLog() {
  const { patientId } = useParams();
  const [logs, setLogs] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const response = await physicianPatientActivityLogs(patientId);
        
        if (response.data.success && response.data.logs) {
          const logsData = response.data.logs;
          
          // Transform logs for chart
          const chartLogs = logsData.map((log) => ({
            date: new Date(log.log_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            weight: log.weight,
            bp_systolic: parseInt(log.bp.split("/")[0]),
            calories: log.calories,
            duration: log.duration_of_physical_activity,
          }));

          setLogs(logsData);
          setChartData(chartLogs.reverse());
        } else {
          setError("Failed to fetch activity logs");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching activity logs");
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchActivityLogs();
    }
  }, [patientId]);

  const handleRowClick = (logId) => {
    navigate(`/physician/patient/${patientId}/activity/${logId}/view`);
  };

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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#333",
      margin: 0,
    },
    backButton: {
      padding: "10px 20px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    },
    chartsContainer: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "20px",
      marginBottom: "30px",
    },
    chartCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px",
    },
    chartTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      marginBottom: "15px",
    },
    tableCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    thtd: { padding: "12px", border: "1px solid #ddd", textAlign: "left" },
    th: {
      backgroundColor: "#f8f9fa",
      fontWeight: "600",
      color: "#333",
    },
    evenRow: { backgroundColor: "#e6f0ff" },
    oddRow: { backgroundColor: "#f9f9f9" },
    tableRow: {
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <p>Loading patient activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Activity Log - {patientName}</h1>
          <button style={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Charts */}
            <div style={styles.chartsContainer}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Weight (lb)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[160, 170]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#8884d8"
                      dot={{ fill: "#8884d8", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Blood Pressure (Systolic)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[110, 130]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bp_systolic"
                      stroke="#82ca9d"
                      dot={{ fill: "#82ca9d", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Calories Consumed</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1500, 2500]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#ffc658"
                      dot={{ fill: "#ffc658", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Physical Activity Duration (minutes)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 70]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#ff7c7c"
                      dot={{ fill: "#ff7c7c", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.th}>
                    <th style={{ ...styles.thtd, ...styles.th }}>Weight (lb)</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>BP</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>Calories</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>Date</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>
                      Physical Activity Duration (minutes)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log, i) => (
                      <tr
                        key={log.log_id}
                        style={{
                          ...styles.tableRow,
                          ...(i % 2 === 0 ? styles.evenRow : styles.oddRow),
                        }}
                        onClick={() => handleRowClick(log.log_id)}
                      >
                        <td style={styles.thtd}>{log.weight}</td>
                        <td style={styles.thtd}>{log.bp}</td>
                        <td style={styles.thtd}>{log.calories}</td>
                        <td style={styles.thtd}>
                          {new Date(log.log_date).toLocaleDateString()}
                        </td>
                        <td style={styles.thtd}>{log.duration_of_physical_activity}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ ...styles.thtd, textAlign: "center" }}>
                        No activity logs found for this patient
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
