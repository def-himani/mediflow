import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Calendar, Users, Pill, Activity, Heart } from "lucide-react";
import Sidebar from "../components/PhysicianSidebar";
import { useNavigate } from "react-router-dom";
import { physicianProfile, physicianAppointments, physicianPatients, physicianDashboardSummary } from "../services/api";

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

export default function PhysicianDashboard() {
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState({ activity_log: null, prescriptions: [] });
  const [profile, setProfile] = useState({ first_name: "Dr.", last_name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPhysician, setFilterPhysician] = useState("");
  const filterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, aptsRes, patientsRes, summaryRes] = await Promise.all([
          physicianProfile(),
          physicianAppointments(),
          physicianPatients(),
          physicianDashboardSummary(),
        ]);
        
        if (profileRes.status === 200) {
          setProfile(profileRes.data.profile || { first_name: "Dr.", last_name: "" });
        }
        if (aptsRes.status === 200) {
          setAppointments(aptsRes.data.appointments || []);
        }
        if (patientsRes.status === 200) {
          setPatients(patientsRes.data.patients || []);
        }
        if (summaryRes.status === 200) {
          setSummary(summaryRes.data || { activity_log: null, prescriptions: [] });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  // derive upcoming (nearest future) and most recent past appointments
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((a) => {
      const d = new Date(a.date);
      return !isNaN(d) && d >= now;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const pastAppointments = appointments
    .filter((a) => {
      const d = new Date(a.date);
      return !isNaN(d) && d < now;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestPast = pastAppointments.length > 0 ? pastAppointments[0] : null;

  // prefer backend-provided next appointment when available
  const displayUpcoming = summary.next_appointment || upcoming;

  const physicianOptions = [...new Set(appointments.map((apt) => apt.physician_name))];

  // count pending appointments for today (exclude Completed/Cancelled)
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const endOfToday = new Date();
  endOfToday.setHours(23,59,59,999);
  const pendingToday = appointments.filter(a => {
    const d = new Date(a.date);
    return a.status === 'Pending' && !isNaN(d) && d >= startOfToday && d <= endOfToday;
  }).length;

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
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardHover: {
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "15px",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      margin: 0,
    },
    cardValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#007bff",
      margin: "10px 0",
    },
    cardText: {
      fontSize: "14px",
      color: "#666",
      margin: "8px 0",
    },
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
    },
    statusBadge: (status) => ({
      backgroundColor: status === "Completed" ? "#d4edda" : status === "Cancelled" ? "#f8d7da" : "#fff3cd",
      color: status === "Completed" ? "#155724" : status === "Cancelled" ? "#721c24" : "#856404",
    }),
    icon: {
      width: "24px",
      height: "24px",
      color: "#007bff",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#333", margin: "0 0 10px 0" }}>Physician Dashboard</h1>
        </div>

        {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading dashboard...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {!loading && !error && (
          <div style={styles.gridContainer}>
            {/* Welcome Card */}
            <div style={{ ...styles.card, ...styles.fullWidth, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "white", margin: 0 }}>
                Welcome Dr. {profile.last_name}!
              </h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", margin: "8px 0 0 0" }}>
                You have <strong>{pendingToday}</strong> appointments today
              </p>
            </div>

            {/* Upcoming Appointment Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Calendar style={styles.icon} />
                <h3 style={styles.cardTitle}>Upcoming Appointment</h3>
              </div>
              {displayUpcoming ? (
                <>
                  <p style={styles.cardValue}>
                    {new Date(displayUpcoming.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p style={styles.cardText}>
                    <strong>Patient:</strong> {displayUpcoming.patient_name}
                  </p>
                  <p style={styles.cardText}>
                    <strong>Reason:</strong> {displayUpcoming.reason || "General checkup"}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ ...styles.cardValue, color: "#666", fontSize: "18px" }}>No upcoming appointments</p>
                  <p style={styles.cardText}>You don't have any pending future appointments scheduled.</p>
                </>
              )}
            </div>

            {/* Patient Overview Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Heart style={styles.icon} />
                <h3 style={styles.cardTitle}>Patient Overview</h3>
              </div>
              {/* show most recent past appointment reason, fallback to upcoming */}
              <p style={styles.cardValue}>{(latestPast || displayUpcoming) ? "1. " + ((latestPast || displayUpcoming).reason || "Routine") : "-"}</p>
              <p style={styles.cardText}>Most recent symptom/diagnosis from latest appointment</p>
            </div>

            {/* Recent Prescription Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Pill style={styles.icon} />
                <h3 style={styles.cardTitle}>Recent Prescription</h3>
              </div>
              {summary.prescriptions && summary.prescriptions.length > 0 ? (
                <div>
                  {summary.prescriptions.map((med, idx) => (
                    <p key={idx} style={styles.cardText}>
                      {idx + 1}. {med.medication_name} {med.dosage} - {med.frequency}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={styles.cardText}>No recent prescriptions</p>
              )}
            </div>

            {/* Activity Log Summary Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Activity style={styles.icon} />
                <h3 style={styles.cardTitle}>Activity Log Summary</h3>
              </div>
              {summary.activity_log ? (
                <div>
                  <p style={styles.cardText}>
                    1. Steps: {summary.activity_log.duration_of_physical_activity || 0}
                  </p>
                  <p style={styles.cardText}>
                    2. BP: {summary.activity_log.bp || "N/A"}
                  </p>
                  <p style={styles.cardText}>
                    3. Weight: {summary.activity_log.weight || "N/A"} kg
                  </p>
                </div>
              ) : (
                <p style={styles.cardText}>No activity log available</p>
              )}
            </div>

            {/* Total Patients Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Users style={styles.icon} />
                <h3 style={styles.cardTitle}>Total Patients</h3>
              </div>
              <p style={styles.cardValue}>{patients.length}</p>
              <p style={styles.cardText}>Active patients under your care</p>
            </div>

            {/* Appointment Statistics */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Appointment Statistics</h3>
              <div style={{ marginTop: "15px" }}>
                <p style={styles.cardText}>
                  ✓ Completed: <strong>{appointments.filter(a => a.status === "Completed").length}</strong>
                </p>
                <p style={styles.cardText}>
                  ⏳ Pending: <strong>{appointments.filter(a => a.status === "Pending").length}</strong>
                </p>
                <p style={styles.cardText}>
                  ✗ Cancelled: <strong>{appointments.filter(a => a.status === "Cancelled").length}</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}