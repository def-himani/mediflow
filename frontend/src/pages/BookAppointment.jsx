import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/PatientSidebar";
import { getPhysicians, getSpecializations, bookAppointment } from "../services/api";
import { useNavigate } from "react-router-dom";

const Input = ({ value, onChange, placeholder, type = "text", required = false, min }) => (
    <input
        type={type}
        style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
        }}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
    />
);

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
    <textarea
        style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            resize: "vertical",
        }}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
    />
);

const Button = ({ children, variant = "primary", ...props }) => (
    <button
        style={{
            padding: "10px 20px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: variant === "primary" ? "#007bff" : variant === "secondary" ? "#6c757d" : "#28a745",
            color: "white",
            cursor: props.disabled ? "not-allowed" : "pointer",
            marginRight: "10px",
            opacity: props.disabled ? 0.6 : 1,
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
            marginBottom: "20px",
        }}
    >
        {children}
    </div>
);

const CardContent = ({ children }) => (
    <div style={{ padding: "20px" }}>{children}</div>
);

export default function BookAppointment() {
    const navigate = useNavigate();
    const [physicians, setPhysicians] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        specialization_id: "",
        physician_id: "",
        date: "",
        reason: "",
        notes: "",
    });

    const [filteredPhysicians, setFilteredPhysicians] = useState([]);

    // Get current datetime in local timezone for min attribute
    const getCurrentDateTime = () => {
        const now = new Date();
        // Format: YYYY-MM-DDTHH:MM
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [physResponse, specResponse] = await Promise.all([
                    getPhysicians(),
                    getSpecializations(),
                ]);

                console.log("Physicians:", physResponse.data);
                console.log("Specializations:", specResponse.data);

                if (physResponse.data.success) {
                    setPhysicians(physResponse.data.physicians || []);
                    setFilteredPhysicians(physResponse.data.physicians || []);
                }

                if (specResponse.data.success) {
                    setSpecializations(specResponse.data.specializations || []);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load appointment booking data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Filter physicians by specialization
        if (field === "specialization_id") {
            if (value === "") {
                setFilteredPhysicians(physicians);
            } else {
                const filtered = physicians.filter((phys) => {
                    return phys.specialization_name === specializations.find(s => s.specialization_id === parseInt(value))?.specialization_name;
                });
                setFilteredPhysicians(filtered);
            }
            // Reset physician selection when specialization changes
            setFormData((prev) => ({ ...prev, physician_id: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.physician_id || !formData.date || !formData.reason) {
            alert("Please fill in all required fields");
            return;
        }

        // Validate that the selected date is in the future
        const selectedDate = new Date(formData.date);
        const now = new Date();

        if (selectedDate <= now) {
            alert("Please select a future date and time for the appointment");
            return;
        }

        try {
            setSubmitting(true);

            // Convert datetime-local format to MySQL DATETIME format
            // datetime-local gives us: "2024-12-01T14:30"
            // MySQL needs: "2024-12-01 14:30:00"
            const formattedDate = new Date(formData.date).toISOString().slice(0, 19).replace('T', ' '); // Convert to ISO string for backend

            const appointmentData = {
                ...formData,
                date: formattedDate
            };

            console.log("Sending appointment data:", appointmentData);

            const response = await bookAppointment(appointmentData);

            if (response.data.success) {
                alert("Appointment booked successfully!");
                navigate("/patient/dashboard");
            } else {
                alert(response.data.message || "Failed to book appointment");
            }
        } catch (err) {
            console.error("Error booking appointment:", err);
            alert(err.response?.data?.message || "Failed to book appointment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/patient/dashboard");
    };

    const styles = {
        container: { display: "flex", height: "100vh" },
        main: {
            flex: 1,
            padding: "20px",
            backgroundColor: "#f0f0f0",
            fontFamily: "Arial, sans-serif",
            overflowY: "auto",
        },
        header: {
            marginBottom: "20px",
        },
        formGroup: { marginBottom: "15px" },
        label: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "bold",
            color: "#333",
        },
        required: {
            color: "red",
            marginLeft: "3px",
        },
        buttonGroup: {
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <div style={styles.main}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <div style={styles.main}>
                    <p style={{ color: "red" }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Sidebar />

            <div style={styles.main}>
                <div style={styles.header}>
                    <h2>Book an Appointment</h2>
                    <p style={{ color: "#666", marginTop: "10px" }}>
                        Schedule a visit with one of our healthcare providers
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                {/* Specialization Selection */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Select Specialization (Optional)
                                    </label>
                                    <select
                                        style={{
                                            padding: "10px",
                                            borderRadius: "4px",
                                            border: "1px solid #ccc",
                                            width: "100%",
                                        }}
                                        value={formData.specialization_id}
                                        onChange={(e) =>
                                            handleInputChange("specialization_id", e.target.value)
                                        }
                                    >
                                        <option value="">All Specializations</option>
                                        {specializations.map((spec) => (
                                            <option
                                                key={spec.specialization_id}
                                                value={spec.specialization_id}
                                            >
                                                {spec.specialization_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Physician Selection */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Select Physician
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <select
                                        style={{
                                            padding: "10px",
                                            borderRadius: "4px",
                                            border: "1px solid #ccc",
                                            width: "100%",
                                        }}
                                        value={formData.physician_id}
                                        onChange={(e) =>
                                            handleInputChange("physician_id", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Choose a physician</option>
                                        {filteredPhysicians.map((phys) => (
                                            <option key={phys.account_id} value={phys.account_id}>
                                                {phys.physician_name} - {phys.specialization_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date and Time */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Appointment Date & Time
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange("date", e.target.value)}
                                        min={getCurrentDateTime()}
                                        required
                                    />
                                    <small style={{ color: "#666", fontSize: "12px" }}>
                                        Please select a future date and time
                                    </small>
                                </div>

                                {/* Reason for Visit */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Reason for Visit
                                        <span style={styles.required}>*</span>
                                    </label>
                                    <Input
                                        value={formData.reason}
                                        onChange={(e) => handleInputChange("reason", e.target.value)}
                                        placeholder="e.g., Annual checkup, Follow-up, Consultation"
                                        required
                                    />
                                </div>

                                {/* Additional Notes */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Additional Notes (Optional)</label>
                                    <TextArea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Any additional information you'd like the physician to know..."
                                        rows={4}
                                    />
                                </div>

                                {/* Buttons */}
                                <div style={styles.buttonGroup}>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCancel}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Booking..." : "Book Appointment"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
