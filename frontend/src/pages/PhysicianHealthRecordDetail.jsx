import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/PhysicianSidebar";
import { getHealthRecordByIdPhysician } from "../services/api";

const GrayField = ({ value, minHeight = 24 }) => (
  <div
    style={{
      backgroundColor: "#e0e0e0",
      padding: "6px 10px",
      borderRadius: "6px",
      marginBottom: "10px",
      minHeight,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {value || "-"}
  </div>
);

const Card = ({ children }) => (
  <div
    style={{
      backgroundColor: "#e6f0ff",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
      display: "flex",
      flexWrap: "wrap",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
  >
    {children}
  </div>
);

function groupHealthRecord(flatData) {
  if (!flatData || flatData.length === 0) return null;

  const record = {
    record_id: flatData[0].record_id,
    patient_id: flatData[0].patient_id,
    visit_date: flatData[0].visit_date,
    diagnosis: flatData[0].diagnosis,
    symptoms: flatData[0].symptoms,
    lab_results: flatData[0].lab_results,
    follow_up_required: flatData[0].follow_up_required,
    physician_name: flatData[0].physician_name,
    prescriptions: [],
  };

  const prescriptionMap = {};

  flatData.forEach((row) => {
    if (row.prescription_id && !prescriptionMap[row.prescription_id]) {
      prescriptionMap[row.prescription_id] = {
        prescription_id: row.prescription_id,
        medicines: [],
      };
      record.prescriptions.push(prescriptionMap[row.prescription_id]);
    }

    if (row.medication_id) {
      prescriptionMap[row.prescription_id].medicines.push({
        medication_id: row.medication_id,
        medication_name: row.medication_name,
        dosage: row.dosage,
        frequency: row.frequency,
        duration: row.duration,
        instructions: row.instructions,
      });
    }
  });

  return record;
}

export default function HealthRecordDetail() {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) return;
      try {
        setLoading(true);
        const response = await getHealthRecordByIdPhysician(recordId);
        if (response.status !== 200) throw new Error("Failed to fetch record");
        const groupedRecord = groupHealthRecord(response.data.healthrecord);
        setRecord(groupedRecord);
      } catch (err) {
        console.error(err);
        setError("Could not fetch health record / You are not permitted to view the health record!");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  const styles = {
    container: { display: "flex", height: "100vh", backgroundColor: "#f0f0f0" },
    main: { flex: 1, padding: "20px", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column" },
    patientInfo: { flex: "0 0 auto", marginBottom: "20px" },
    prescriptionsContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#fafafa",
      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
    },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    sectionLabel: { fontWeight: "bold", marginBottom: "6px" },
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading record...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  if (!record) return <p style={{ padding: "20px" }}>No record found.</p>;

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.patientInfo}>
          <div style={styles.headerRow}>
            <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>View Health Record</h2>
          </div>

          <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <p style={styles.sectionLabel}>Patient ID</p>
              <GrayField value={record.patient_id} minHeight={35} />
            </div>
            <div style={{ minWidth: "180px", maxWidth: "250px" }}>
              <p style={styles.sectionLabel}>Date</p>
              <GrayField value={record.visit_date} minHeight={35} />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={styles.sectionLabel}>Symptoms</p>
            <GrayField value={record.symptoms} minHeight={40} />
          </div>

          <div style={{ display: "flex", gap: "40px", marginBottom: "30px" }}>
            <div style={{ flex: 1 }}>
              <p style={styles.sectionLabel}>Lab Results</p>
              <GrayField value={record.lab_results} minHeight={80} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={styles.sectionLabel}>Diagnosis</p>
              <GrayField value={record.diagnosis} minHeight={80} />
            </div>
          </div>
        </div>

        <div style={styles.prescriptionsContainer}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontWeight: "bold", fontSize: "20px", flex: 1 }}>Prescriptions</h3>
          </div>

          {record.prescriptions?.length > 0 ? (
            record.prescriptions.map((prescription, idx) => (
              <div key={prescription.prescription_id || idx} style={{ marginBottom: "20px" }}>
                {prescription.medicines?.map((med, index) => (
                  <Card key={`${prescription.prescription_id}-${index}`}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <h4 style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>
                        {med.medication_name || `Medicine ${index + 1}`}
                      </h4>

                      <p style={styles.sectionLabel}>Dosage</p>
                      <GrayField value={med.dosage} />

                      <p style={styles.sectionLabel}>Frequency</p>
                      <GrayField value={med.frequency} />

                      <p style={styles.sectionLabel}>Duration</p>
                      <GrayField value={med.duration} />
                    </div>

                    <div style={{ flex: 1, paddingLeft: "20px", minWidth: "200px" }}>
                      <p style={styles.sectionLabel}>Instructions</p>
                      <GrayField value={med.instructions} minHeight={100} />
                    </div>
                  </Card>
                ))}
              </div>
            ))
          ) : (
            <p>No prescriptions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
