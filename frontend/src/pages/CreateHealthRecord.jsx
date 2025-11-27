import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/PhysicianSidebar";
import { getMedications, createHealthRecord } from "../services/api";

export default function CreateHealthRecord() {
  const { patientId } = useParams();

  const [visitDate, setVisitDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [labResults, setLabResults] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState("");

  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([
    { medication_id: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await getMedications();
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        setMedications(response.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch medications.");
      }
    };
    fetchMedications();
  }, []);

  const addMedicine = () => {
    setPrescriptions([
      ...prescriptions,
      { medication_id: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const isFormValid = () => {
    if (!visitDate || !diagnosis || !symptoms || !labResults || !followUpRequired) return false;
    for (let med of prescriptions) {
      if (!med.medication_id || !med.dosage || !med.frequency || !med.duration || !med.instructions)
        return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!isFormValid()) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const payload = {
      patient_id: patientId,
      visit_date: visitDate,
      diagnosis,
      symptoms,
      lab_results: labResults,
      follow_up_required: followUpRequired,
      prescriptions,
    };

    try {
      const response = await createHealthRecord(payload);
      if (response.data.success) {
        alert("Health record created successfully!");
      } else {
        alert(response.data.message || response.data.error || "Error creating health record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating health record.");
    }
  };

  const styles = {
    container: { display: "flex", height: "100vh", backgroundColor: "#f0f0f0" },
    main: { flex: 1, padding: "20px", fontFamily: "Arial, sans-serif" },
    field: { backgroundColor: "#f9f9f9", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "100%", marginBottom: "12px" },
    label: { fontWeight: "bold", marginBottom: "6px" },
    card: { backgroundColor: "#e6f0ff", borderRadius: "8px", padding: "16px", marginBottom: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
    button: { padding: "10px 18px", backgroundColor: "#4a90e2", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>Create Health Record</h2>

        <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
          <div style={{ width: "300px" }}>
            <p style={styles.label}>Patient ID</p>
            <input value={patientId} disabled style={styles.field} />
          </div>

          <div style={{ width: "300px" }}>
            <p style={styles.label}>Visit Date</p>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} style={styles.field} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <p style={styles.label}>Lab Results</p>
            <textarea value={labResults} onChange={(e) => setLabResults(e.target.value)} style={{ ...styles.field, minHeight: "80px" }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={styles.label}>Diagnosis</p>
            <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={styles.field} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p style={styles.label}>Symptoms</p>
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} style={{ ...styles.field, minHeight: "60px" }} />
        </div>

        <div style={{ marginBottom: "20px", maxWidth: "300px" }}>
          <p style={styles.label}>Follow-Up Required</p>
          <select value={followUpRequired} onChange={(e) => setFollowUpRequired(e.target.value)} style={styles.field}>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "10px" }}>Prescriptions</h3>

        {prescriptions.map((med, i) => {
          const selectedMedIds = new Set(
            prescriptions.filter((_, idx) => idx !== i).map((p) => Number(p.medication_id)).filter(Boolean)
          );

          const availableMeds = medications.filter(
            (m) => !selectedMedIds.has(m.medication_id) || m.medication_id === Number(med.medication_id)
          );

          return (
            <div key={i} style={styles.card}>
              <h4 style={{ fontSize: "18px", fontWeight: "bold" }}>Medicine {i + 1}</h4>

              <p style={styles.label}>Medication</p>
              <select
                value={med.medication_id}
                onChange={(e) => handleMedChange(i, "medication_id", Number(e.target.value))}
                style={styles.field}
              >
                <option value="">Select medication</option>
                {availableMeds.map((m) => (
                  <option key={m.medication_id} value={m.medication_id}>
                    {m.medication_name}
                  </option>
                ))}
              </select>

              <p style={styles.label}>Dosage</p>
              <input value={med.dosage} onChange={(e) => handleMedChange(i, "dosage", e.target.value)} style={styles.field} />

              <p style={styles.label}>Frequency</p>
              <input value={med.frequency} onChange={(e) => handleMedChange(i, "frequency", e.target.value)} style={styles.field} />

              <p style={styles.label}>Duration</p>
              <input value={med.duration} onChange={(e) => handleMedChange(i, "duration", e.target.value)} style={styles.field} />

              <p style={styles.label}>Instructions</p>
              <textarea value={med.instructions} onChange={(e) => handleMedChange(i, "instructions", e.target.value)} style={{ ...styles.field, minHeight: "80px" }} />
            </div>
          );
        })}

        <button
          style={styles.button}
          onClick={addMedicine}
          disabled={prescriptions.length >= medications.length}
        >
          + Add Medicine
        </button>

        <div style={{ marginTop: "30px" }}>
          <button
            style={{
              ...styles.button,
              opacity: isFormValid() ? 1 : 0.5,
              cursor: isFormValid() ? "pointer" : "not-allowed",
            }}
            disabled={!isFormValid()}
            onClick={handleCreate}
          >
            Create Health Record
          </button>
        </div>
      </div>
    </div>
  );
}
