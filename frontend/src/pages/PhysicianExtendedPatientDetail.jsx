import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/PhysicianSidebar";
import { physicianPatientVisits } from "../services/api";

export default function PhysicianExtendedPatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleHealthRecordClick = (recordId) => {
    navigate(`/physician/healthRecord/record/${recordId}`);
  };

  const handleCreateHealthRecord = () => {
    navigate(`/physician/healthrecord/create/${patientId}`);
  };

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const res = await physicianPatientVisits(patientId);
        if (res.status !== 200) throw new Error("Failed to fetch");
        const data = res.data || {};
        // API returns { success: true, visits: [ {record_id, visit_date, diagnosis, symptoms, lab_results, follow_up_required, physician_name}, ... ] }
        const rows = (data.visits || []).map((v) => ({
          record_id: v.record_id,
          diagnosis: v.diagnosis || "-",
          symptom: v.symptoms || "-",
          followUp: !!v.follow_up_required,
          visitDate: v.visit_date,
          physician: v.physician_name || "-",
        }));
        setVisits(rows);
      } catch (err) {
        console.error(err);
        setError("Could not load patient visits");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [patientId]);

  const styles = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, padding: "20px", backgroundColor: "#f0f0f0", fontFamily: "Arial, sans-serif", overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    thtd: { padding: "8px", border: "1px solid #ccc" },
    evenRow: { backgroundColor: "#e6f0ff" },
    oddRow: { backgroundColor: "#f9f9f9" },
    header: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 16 },
    backButton: { padding: "8px 12px", borderRadius: 6, border: "none", background: "#007bff", color: "white", cursor: "pointer" },
    healthButton: { padding: "8px 12px", borderRadius: 6, border: "none", background: "#17a2b8", color: "white", cursor: "pointer", fontWeight: 600 }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>Back</button>
          <h2 style={{ margin: 0 }}>Patient Visits (Extended)</h2>
          <button style={styles.healthButton} onClick={handleCreateHealthRecord}>Health Records+</button>
        </div>

        {loading && <p>Loading visits...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div style={{ background: "white", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,0.12)", padding: 12 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thtd}>Diagnosis</th>
                  <th style={styles.thtd}>Symptom</th>
                  <th style={styles.thtd}>Follow up required?</th>
                  <th style={styles.thtd}>Visit date</th>
                  <th style={styles.thtd}>Physician</th>
                </tr>
              </thead>
              <tbody>
                {visits.length > 0 ? (
                  visits.map((v, i) => (
                    <tr key={i} style={i % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td style={{ ...styles.thtd, cursor: "pointer", color: "#007bff", textDecoration: "underline" }} onClick={() => handleHealthRecordClick(v.record_id)}>{v.diagnosis}</td>
                      <td style={styles.thtd}>{v.symptom}</td>
                      <td style={styles.thtd}>{v.followUp ? "Yes" : "No"}</td>
                      <td style={styles.thtd}>{v.visitDate ? new Date(v.visitDate).toLocaleString() : "-"}</td>
                      <td style={styles.thtd}>{v.physician}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ ...styles.thtd, textAlign: "center" }}>No visits found for this patient</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
