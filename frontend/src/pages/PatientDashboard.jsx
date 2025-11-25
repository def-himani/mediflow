import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/PatientSidebar";
import { useNavigate } from "react-router-dom";
import { patientDashboard } from "../services/api";

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

export default function PatientDashboard() {
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPhysician, setFilterPhysician] = useState("");
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await patientDashboard();
        if (response.status !== 200)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.data;
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
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = appointments.filter((apt) => {
    const q = query.toLowerCase();
    const matchesSearch =
      apt.reason?.toLowerCase().includes(q) ||
      apt.physician_name?.toLowerCase().includes(q) ||
      apt.date?.toLowerCase().includes(q) ||
      apt.notes?.toLowerCase().includes(q);

    const matchesStatus = filterStatus ? apt.status === filterStatus : true;
    const matchesPhysician = filterPhysician ? apt.physician_name === filterPhysician : true;

    return matchesSearch && matchesStatus && matchesPhysician;
  });

  console.log(filtered);

  const physicianOptions = [...new Set(appointments.map((apt) => apt.physician_name))];

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
      marginBottom: "20px" 
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
                  <select
                    style={styles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label style={styles.filterLabel}>Physician:</label>
                  <select
                    style={styles.filterSelect}
                    value={filterPhysician}
                    onChange={(e) => setFilterPhysician(e.target.value)}
                  >
                    <option value="">All</option>
                    {physicianOptions.map((p, i) => (
                      <option key={i} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => setShowFilter(false)}>Apply</Button>
              </div>
            )}
          </div>

          <h2>Upcoming Appointments</h2>

          <div style={styles.searchBar}>
            <Input
              placeholder="Search appointments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              style={styles.bookButton}
              onClick={() => navigate("/patient/appointment/book")}
            >
              + Book Appointment
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
                    <th style={styles.thtd}>Physician</th>
                    <th style={styles.thtd}>Date</th>
                    <th style={styles.thtd}>Reason</th>
                    <th style={styles.thtd}>Status</th>
                    <th style={styles.thtd}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((apt, i) => (
                      <motion.tr
                        key={apt.appointment_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        style={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                      >
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
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor:
                                apt.status === "Pending" ? "#fff3cd" : apt.status === "Completed" ? "#d4edda" : "#f8d7da",
                              color:
                                apt.status === "Pending" ? "#856404" : apt.status === "Completed" ? "#155724" : "#721c24",
                            }}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td style={styles.thtd}>{apt.notes}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ ...styles.thtd, textAlign: "center" }}>
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