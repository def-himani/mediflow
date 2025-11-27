import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sidebar from "../components/PatientSidebar";
import { patientDashboard, cancelAppointment } from "../services/api";
import { useNavigate } from "react-router-dom";

const Input = ({ value, onChange, placeholder }) => (
  <input
    style={{
      padding: "6px 10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    }}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

const Button = ({ children, ...props }) => (
  <button
    style={{
      padding: "6px 12px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      cursor: "pointer",
    }}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children }) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    }}
  >
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div style={{ padding: "10px" }}>{children}</div>
);

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await patientDashboard();
        if (response.status !== 200)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = response.data;
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((apt) => {
    const q = query.toLowerCase();
    return (
      apt.reason?.toLowerCase().includes(q) ||
      apt.physician_name?.toLowerCase().includes(q) ||
      apt.date?.toLowerCase().includes(q) ||
      (apt.notes || "").toLowerCase().includes(q)
    );
  });

  const handleCancel = async (appointmentId, e) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    // Optimistic UI update
    setAppointments((prev) =>
      prev.map((a) =>
        a.appointment_id === appointmentId ? { ...a, status: "Cancelled" } : a
      )
    );

    try {
      const res = await cancelAppointment(appointmentId);
      if (res.status !== 200 || !res.data.success) {
        throw new Error(res.data?.message || "Failed to cancel");
      }
      alert("Appointment cancelled successfully");
    } catch (err) {
      console.error(err);
      // Rollback optimistic change on error
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appointmentId ? { ...a, status: "Pending" } : a
        )
      );
      alert(err.message || "Failed to cancel appointment");
    }
  };

  const handleBookAppointment = () => {
    navigate("/patient/appointment/book");
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: { bg: "#fff3cd", color: "#856404" },
      Completed: { bg: "#d4edda", color: "#155724" },
      Cancelled: { bg: "#f8d7da", color: "#721c24" },
    };
    return colors[status] || colors.Pending;
  };

  const styles = {
    container: { display: "flex", height: "100vh" },
    main: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#f0f0f0",
      fontFamily: "Arial, sans-serif",
      overflow: "auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    searchBar: { display: "flex", gap: "10px" },
    table: { width: "100%", borderCollapse: "collapse" },
    thtd: { padding: "8px", border: "1px solid #ccc" },
    evenRow: { backgroundColor: "#e6f0ff", cursor: "pointer" },
    oddRow: { backgroundColor: "#f9f9f9", cursor: "pointer" },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
    },
    expandedContent: {
      padding: "15px",
      backgroundColor: "#f8f9fa",
    },
    detailRow: {
      marginBottom: "10px",
    },
    detailLabel: {
      fontWeight: "600",
      color: "#555",
      marginBottom: "3px",
    },
    detailValue: {
      color: "#333",
    },
    bookButton: {
      padding: "10px 20px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#28a745",
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
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>My Appointments</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Input
              placeholder="Search appointments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button style={styles.bookButton} onClick={handleBookAppointment}>
              Book Appointment
            </button>
          </div>
        </div>

        {loading && <p>Loading appointments...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <Card>
            <CardContent>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thtd}></th>
                    <th style={styles.thtd}>Physician</th>
                    <th style={styles.thtd}>Date</th>
                    <th style={styles.thtd}>Reason</th>
                    <th style={styles.thtd}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((apt, i) => (
                      <React.Fragment key={apt.appointment_id || i}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          style={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                          onClick={() =>
                            setExpandedId(
                              expandedId === apt.appointment_id
                                ? null
                                : apt.appointment_id
                            )
                          }
                        >
                          <td style={styles.thtd}>
                            {expandedId === apt.appointment_id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </td>
                          <td style={styles.thtd}>{apt.physician_name}</td>
                          <td style={styles.thtd}>
                            {new Date(apt.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td style={styles.thtd}>{apt.reason}</td>
                          <td style={styles.thtd}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(apt.status).bg,
                                color: getStatusColor(apt.status).color,
                              }}
                            >
                              {apt.status}
                            </span>
                          </td>
                        </motion.tr>

                        {expandedId === apt.appointment_id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <td colSpan="5" style={{ padding: 0 }}>
                              <div style={styles.expandedContent}>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "15px",
                                    marginBottom: "15px",
                                  }}
                                >
                                  <div style={styles.detailRow}>
                                    <div style={styles.detailLabel}>Time</div>
                                    <div style={styles.detailValue}>
                                      {new Date(apt.date).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        }
                                      )}
                                    </div>
                                  </div>

                                  <div style={styles.detailRow}>
                                    <div style={styles.detailLabel}>
                                      Physician
                                    </div>
                                    <div style={styles.detailValue}>
                                      {apt.physician_name}
                                    </div>
                                  </div>

                                  <div style={styles.detailRow}>
                                    <div style={styles.detailLabel}>Reason</div>
                                    <div style={styles.detailValue}>
                                      {apt.reason}
                                    </div>
                                  </div>

                                  <div style={styles.detailRow}>
                                    <div style={styles.detailLabel}>Status</div>
                                    <div style={styles.detailValue}>
                                      {apt.status}
                                    </div>
                                  </div>
                                </div>

                                {apt.notes && (
                                  <div style={styles.detailRow}>
                                    <div style={styles.detailLabel}>Notes</div>
                                    <div style={styles.detailValue}>
                                      {apt.notes}
                                    </div>
                                  </div>
                                )}

                                {apt.status === "Pending" && (
                                  <div
                                    style={{
                                      marginTop: "15px",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <button
                                      style={{
                                        padding: "8px 16px",
                                        borderRadius: "4px",
                                        border: "none",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                      }}
                                      onClick={(e) =>
                                        handleCancel(apt.appointment_id, e)
                                      }
                                    >
                                      Cancel Appointment
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ ...styles.thtd, textAlign: "center" }}
                      >
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}