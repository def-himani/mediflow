import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/PatientSidebar";
import { patientHealthRecord } from "../services/api";
import { getHealthRecordById } from "../services/api";
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

export default function PatientHealthRecord() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterFollowUp, setFilterFollowUp] = useState(""); 
  const [filterPhysician, setFilterPhysician] = useState(""); 
  const [hoveredRow, setHoveredRow] = useState(null);

  const filterRef = useRef(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await patientHealthRecord();
        if (response.status !== 200)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.data;
        setRecords(data.healthrecords || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch health records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);


    const handleRowClick = async (record_id) => {
        try {
            // const response = await getHealthRecordById(record_id); // POST request
            // const recordData = response.data;
            navigate(`/patient/healthrecord/${record_id}`);
        } catch (err) {
            console.error("Failed to fetch health record", err);
            alert("Could not fetch record");
        }
    };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = records.filter((r) => {
    const q = query.toLowerCase();
    const matchesSearch =
      r.diagnosis?.toLowerCase().includes(q) ||
      r.symptoms?.toLowerCase().includes(q) ||
      r.physician_name?.toLowerCase().includes(q) ||
      r.visit_date?.toLowerCase().includes(q);

    const matchesFollowUp = filterFollowUp ? r.follow_up_required === filterFollowUp : true;
    const matchesPhysician = filterPhysician ? r.physician_name === filterPhysician : true;

    return matchesSearch && matchesFollowUp && matchesPhysician;
  });

  const physicianOptions = [...new Set(records.map((r) => r.physician_name))];

  const styles = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, padding: "20px", backgroundColor: "#f0f0f0", fontFamily: "Arial, sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
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
    filterSelect: { marginBottom: "10px", padding: "4px 6px" },
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
                  <label style={styles.filterLabel}>Follow Up:</label>
                  <select
                    style={styles.filterSelect}
                    value={filterFollowUp}
                    onChange={(e) => setFilterFollowUp(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
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

          <h2>Patient Health Records</h2>

          <div style={styles.searchBar}>
            <Input
              placeholder="Search records..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && <p>Loading health records...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <Card>
            <CardContent>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thtd}>Diagnosis</th>
                    <th style={styles.thtd}>Symptom</th>
                    <th style={styles.thtd}>Follow Up Required?</th>
                    <th style={styles.thtd}>Visit Date</th>
                    <th style={styles.thtd}>Physician</th>
                  </tr>
                </thead>

                <tbody>
                {filtered.map((row, i) => {
                    const baseColor = i % 2 === 0 ? "#e6f0ff" : "#f9f9f9";
                    const hoverColor = "rgba(0, 123, 255, 0.1)";

                    return (
                        <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        style={{
                            cursor: "pointer",
                            backgroundColor: hoveredRow === i ? "rgba(0, 123, 255, 0.1)" : (i % 2 === 0 ? "#e6f0ff" : "#f9f9f9"),
                            transition: "background-color 0.2s",
                        }}
                        onClick={() => handleRowClick(row.record_id)}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        >
                        <td style={styles.thtd}>{row.diagnosis}</td>
                        <td style={styles.thtd}>{row.symptoms}</td>
                        <td style={styles.thtd}>{row.follow_up_required}</td>
                        <td style={styles.thtd}>{row.visit_date}</td>
                        <td style={styles.thtd}>{row.physician_name}</td>
                        </motion.tr>
                    );
                })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
