import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sidebar from "../components/PhysicianSidebar";
import { useNavigate } from "react-router-dom";
import { physicianAppointments, updateAppointmentStatus } from "../services/api";

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
      position: "relative",
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

const CardContent = ({ children }) => <div style={{ padding: "10px" }}>{children}</div>;

export default function PhysicianAppointmentList() {
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await physicianAppointments();
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        const data = response.data || {};
        // API returns { success: true, appointments: [...] }
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilter(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = appointments.filter((apt) => {
    const q = query.toLowerCase();
    const matchesSearch =
      apt.reason?.toLowerCase().includes(q) ||
      apt.patient_name?.toLowerCase().includes(q) ||
      apt.date?.toLowerCase().includes(q) ||
      (apt.notes || "").toLowerCase().includes(q);

    const matchesStatus = filterStatus ? apt.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

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
    evenRow: { backgroundColor: "#e6f0ff" },
    oddRow: { backgroundColor: "#f9f9f9" },
    filterDropdown: {
      position: "absolute",
      top: "35px",
      left: 0,
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      zIndex: 10,
    },
    filterLabel: { marginRight: "5px" },
    filterSelect: { marginBottom: "10px", padding: "4px 6px", width: "100%" },
    bookButton: {
      padding: "6px 12px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#28a745",
      color: "white",
      cursor: "pointer",
      fontWeight: "600",
    },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
    },
    expandedContent: {
      marginTop: "15px",
      paddingTop: "15px",
      borderTop: "1px solid #eee",
    },
    detailRow: {
      display: "flex",
      justifyContent: "space-between",
      paddingBottom: "8px",
      borderBottom: "1px solid #f0f0f0",
    },
    detailLabel: { fontWeight: "600", color: "#555" },
    detailValue: { color: "#333" },
  };

  const getStatusColor = (status) => {
    const colors = { Pending: { bg: "#fff3cd", color: "#856404" }, Completed: { bg: "#d4edda", color: "#155724" }, Cancelled: { bg: "#f8d7da", color: "#721c24" } };
    return colors[status] || colors.Pending;
  };

  const handleComplete = async (appointmentId, e) => {
    e.stopPropagation();
    // Optimistic UI update
    setAppointments((prev) => prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: "Completed" } : a)));
    try {
      const res = await updateAppointmentStatus(appointmentId, "Completed");
      if (res.status !== 200 || !res.data || !res.data.success) {
        throw new Error((res.data && res.data.message) || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      // rollback optimistic change on error
      setAppointments((prev) => prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: "Pending" } : a)));
      setError("Failed to update appointment status");
    }
  };

  const handleCancel = async (appointmentId, e) => {
    e.stopPropagation();
    setAppointments((prev) => prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: "Cancelled" } : a)));
    try {
      const res = await updateAppointmentStatus(appointmentId, "Cancelled");
      if (res.status !== 200 || !res.data || !res.data.success) {
        throw new Error((res.data && res.data.message) || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      // rollback optimistic change on error
      setAppointments((prev) => prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: "Pending" } : a)));
      setError("Failed to update appointment status");
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.header}>
          <div style={{ position: "relative" }} ref={filterRef}>
            <Button onClick={() => setShowFilter(!showFilter)}>
              Filter <ChevronDown size={16} />
            </Button>
            {showFilter && (
              <div style={styles.filterDropdown}>
                <div>
                  <label style={styles.filterLabel}>Status:</label>
                  <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <Button onClick={() => setShowFilter(false)}>Apply</Button>
              </div>
            )}
          </div>

          <h2 style={{ margin: 0 }}>Appointments</h2>

          <div style={styles.searchBar}>
            <Input placeholder="Search appointments..." value={query} onChange={(e) => setQuery(e.target.value)} />
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
                    <th style={styles.thtd}>Name</th>
                    <th style={styles.thtd}>Age</th>
                    <th style={styles.thtd}>Place</th>
                    <th style={styles.thtd}>Date</th>
                    <th style={styles.thtd}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((apt, i) => (
                      <React.Fragment key={apt.appointment_id || apt.id || i}>
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: i * 0.05 }} style={i % 2 === 0 ? styles.evenRow : styles.oddRow} onClick={() => setExpandedId(expandedId === (apt.appointment_id || apt.id) ? null : (apt.appointment_id || apt.id))}>
                          <td style={styles.thtd}>{expandedId === (apt.appointment_id || apt.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</td>
                          <td style={styles.thtd}>{apt.patient_name}</td>
                          <td style={styles.thtd}>{apt.age || "-"}</td>
                          <td style={styles.thtd}>{apt.place || apt.reason || "-"}</td>
                          <td style={styles.thtd}>{new Date(apt.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                          <td style={styles.thtd}><span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(apt.status).bg, color: getStatusColor(apt.status).color }}>{apt.status}</span></td>
                        </motion.tr>

                        {expandedId === (apt.appointment_id || apt.id) && (
                          <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                            <td colSpan="6" style={{ padding: 0 }}>
                              <div style={styles.expandedContent}>
                                <div style={{ display: "flex", gap: 20 }}>
                                  <div>
                                    <div style={styles.detailLabel}>Time</div>
                                    <div style={styles.detailValue}>{new Date(apt.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                                  </div>
                                  <div>
                                    <div style={styles.detailLabel}>Physician</div>
                                    <div style={styles.detailValue}>{apt.physician_name || "N/A"}</div>
                                  </div>
                                  <div>
                                    <div style={styles.detailLabel}>Department</div>
                                    <div style={styles.detailValue}>{apt.department || "General"}</div>
                                  </div>
                                </div>

                                {apt.status === 'Pending' && (
                                  <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: "#28a745", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" }} onClick={(e) => handleComplete(apt.appointment_id || apt.id, e)}>Complete</button>
                                    <button style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: "#dc3545", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px" }} onClick={(e) => handleCancel(apt.appointment_id || apt.id, e)}>Cancel</button>
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
                      <td colSpan={6} style={{ ...styles.thtd, textAlign: "center" }}>No appointments found</td>
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
