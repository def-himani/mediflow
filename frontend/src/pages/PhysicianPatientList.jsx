import React, { useEffect, useState } from "react";
import Sidebar from "../components/PhysicianSidebar";
import { useNavigate } from "react-router-dom";
import { physicianPatients, physicianPatientVisits } from "../services/api";

export default function PhysicianPatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await physicianPatients();
        if (res.status !== 200) throw new Error("Failed to fetch");
        const data = res.data || {};
        // API returns { success: true, patients: [...] } with fields:
        // patient_id, patient_name, age, recent_date, physician_name
        // Fetch visits for each patient to get record_id
        const patientsWithRecords = await Promise.all(
          (data.patients || []).map(async (p) => {
            try {
              const visitsRes = await physicianPatientVisits(p.patient_id);
              const mostRecentRecord = visitsRes.data?.visits?.[0]?.record_id || null;
              return { ...p, record_id: mostRecentRecord };
            } catch {
              return { ...p, record_id: null };
            }
          })
        );
        setPatients(patientsWithRecords);
      } catch (err) {
        console.error(err);
        setError("Could not load patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleActivityClick = (patientId) => {
    navigate(`/physician/patient/${patientId}/activitylog`);
  };

  const handleHealthRecordClick = (recordId) => {
    if (recordId) {
      navigate(`/physician/healthRecord/record/${recordId}`);
    }
  };

  const handleExtendedClick = (patientId) => {
    navigate(`/physician/patient/${patientId}/extended`);
  };

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

  const styles = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, padding: "20px", backgroundColor: "#f0f0f0", fontFamily: "Arial, sans-serif", overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    thtd: { padding: "8px", border: "1px solid #ccc" },
    evenRow: { backgroundColor: "#e6f0ff" },
    oddRow: { backgroundColor: "#f9f9f9" },
    header: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "20px"
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
        <h2>Patient List</h2>
        </div>

        {loading && <p>Loading patients...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <Card>
            <CardContent>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thtd}>Name</th>
                    <th style={styles.thtd}>Age</th>
                    <th style={styles.thtd}>Activity Log</th>
                    <th style={styles.thtd}>Date</th>
                    <th style={styles.thtd}>Health Record</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, i) => (
                    <tr
                      key={p.patient_id || i}
                      style={i % 2 === 0 ? { ...styles.evenRow, cursor: "pointer" } : { ...styles.oddRow, cursor: "pointer" }}
                      onClick={() => handleExtendedClick(p.patient_id)}
                    >
                      <td style={styles.thtd}>{p.patient_name}</td>
                      <td style={styles.thtd}>{p.age || "-"}</td>
                      <td style={styles.thtd}>
                        <button
                          style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline", background: "none", border: "none", padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); handleActivityClick(p.patient_id); }}
                        >
                          Link
                        </button>
                      </td>
                      <td style={styles.thtd}>{p.recent_date ? new Date(p.recent_date).toLocaleDateString() : "-"}</td>
                      <td style={styles.thtd}>
                        <button
                          style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline", background: "none", border: "none", padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); handleHealthRecordClick(p.record_id); }}
                        >
                          Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
