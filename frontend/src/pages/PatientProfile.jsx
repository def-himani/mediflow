import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/PatientSidebar";
import { getPatientProfile, updatePatientProfile, getInsurances, getPharmacies } from "../services/api";

const Input = ({ value, onChange, placeholder, disabled, type = "text" }) => (
    <input
        type={type}
        style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            backgroundColor: disabled ? "#f5f5f5" : "white",
        }}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
    />
);

const Select = ({ value, onChange, options, disabled }) => (
    <select
        style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            backgroundColor: disabled ? "#f5f5f5" : "white",
        }}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
    >
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
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

export default function PatientProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [insurances, setInsurances] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "",
        date_of_birth: "",
        address: "",
        emergency_contact: "",
        insurance_id: "",
        pharmacy_id: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch profile
                const profileResponse = await getPatientProfile();
                console.log("Profile response:", profileResponse.data);

                if (profileResponse.status !== 200 || !profileResponse.data.success) {
                    throw new Error(profileResponse.data.message || "Failed to fetch profile");
                }

                const profileData = profileResponse.data.profile;
                setProfile(profileData);
                setFormData({
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    email: profileData.email || "",
                    phone: profileData.phone || "",
                    gender: profileData.gender || "",
                    date_of_birth: profileData.date_of_birth || "",
                    address: profileData.address || "",
                    emergency_contact: profileData.emergency_contact || "",
                    insurance_id: profileData.insurance_id || "",
                    pharmacy_id: profileData.pharmacy_id || "",
                });

                // Fetch insurances and pharmacies for dropdowns
                const [insResponse, pharmResponse] = await Promise.all([
                    getInsurances(),
                    getPharmacies()
                ]);

                console.log("Insurances:", insResponse.data);
                console.log("Pharmacies:", pharmResponse.data);

                setInsurances(insResponse.data.insurances || insResponse.data || []);
                setPharmacies(pharmResponse.data.pharmacies || pharmResponse.data || []);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to fetch profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Helper to format date properly for sql
            const formatDateForSQL = (dateString) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-index
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const profileUpdateData = {
                ...formData,
                date_of_birth: formatDateForSQL(formData.date_of_birth)
            }

            console.log(profileUpdateData.date_of_birth);

            const response = await updatePatientProfile(profileUpdateData);

            if (response.status !== 200 || !response.data.success) {
                throw new Error(response.data.message || "Failed to update profile");
            }

            // Refresh profile data
            const profileResponse = await getPatientProfile();
            const profileData = profileResponse.data.profile;
            setProfile(profileData);

            setEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original profile values
        if (profile) {
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                gender: profile.gender || "",
                date_of_birth: profile.date_of_birth || "",
                address: profile.address || "",
                emergency_contact: profile.emergency_contact || "",
                insurance_id: profile.insurance_id || "",
                pharmacy_id: profile.pharmacy_id || "",
            });
        }
        setEditing(false);
    };

    const genderOptions = [
        { value: "M", label: "Male" },
        { value: "F", label: "Female" },
        { value: "O", label: "Other" },
    ];

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
        },
        formGroup: { marginBottom: "15px" },
        label: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "bold",
            color: "#333",
        },
        infoText: {
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            border: "1px solid #ddd",
        },
        section: { marginBottom: "30px" },
        sectionTitle: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#007bff",
            borderBottom: "2px solid #007bff",
            paddingBottom: "5px",
        },
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <div style={styles.main}>
                    <p>Loading profile...</p>
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

    if (!profile) {
        return (
            <div style={styles.container}>
                <Sidebar />
                <div style={styles.main}>
                    <p>No profile data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Sidebar />

            <div style={styles.main}>
                <div style={styles.header}>
                    <h2>My Profile</h2>
                    <div>
                        {!editing ? (
                            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                        ) : (
                            <>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Personal Information */}
                    <Card>
                        <CardContent>
                            <div style={styles.section}>
                                <div style={styles.sectionTitle}>Personal Information</div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Username (Read-only)</label>
                                    <div style={styles.infoText}>{profile.user_name}</div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>First Name</label>
                                    {editing ? (
                                        <Input
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                handleInputChange("first_name", e.target.value)
                                            }
                                            placeholder="Enter first name"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.first_name}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Last Name</label>
                                    {editing ? (
                                        <Input
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                handleInputChange("last_name", e.target.value)
                                            }
                                            placeholder="Enter last name"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.last_name}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Date of Birth</label>
                                    {editing ? (
                                        <Input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) =>
                                                handleInputChange("date_of_birth", e.target.value)
                                            }
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.date_of_birth}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Gender</label>
                                    {editing ? (
                                        <Select
                                            value={formData.gender}
                                            onChange={(e) =>
                                                handleInputChange("gender", e.target.value)
                                            }
                                            options={genderOptions}
                                        />
                                    ) : (
                                        <div style={styles.infoText}>
                                            {profile.gender === "M"
                                                ? "Male"
                                                : profile.gender === "F"
                                                    ? "Female"
                                                    : "Other"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardContent>
                            <div style={styles.section}>
                                <div style={styles.sectionTitle}>Contact Information</div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email</label>
                                    {editing ? (
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange("email", e.target.value)
                                            }
                                            placeholder="Enter email address"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.email}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone</label>
                                    {editing ? (
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) =>
                                                handleInputChange("phone", e.target.value)
                                            }
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.phone}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Address</label>
                                    {editing ? (
                                        <Input
                                            value={formData.address}
                                            onChange={(e) =>
                                                handleInputChange("address", e.target.value)
                                            }
                                            placeholder="Enter full address"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>{profile.address}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Emergency Contact</label>
                                    {editing ? (
                                        <Input
                                            value={formData.emergency_contact}
                                            onChange={(e) =>
                                                handleInputChange("emergency_contact", e.target.value)
                                            }
                                            placeholder="Enter emergency contact"
                                        />
                                    ) : (
                                        <div style={styles.infoText}>
                                            {profile.emergency_contact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Insurance Information */}
                    <Card>
                        <CardContent>
                            <div style={styles.section}>
                                <div style={styles.sectionTitle}>Insurance Information</div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Insurance Provider</label>
                                    {editing ? (
                                        <select
                                            style={{
                                                padding: "10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ccc",
                                                width: "100%",
                                            }}
                                            value={formData.insurance_id}
                                            onChange={(e) =>
                                                handleInputChange("insurance_id", e.target.value)
                                            }
                                        >
                                            <option value="">Select Insurance</option>
                                            {insurances.map((ins) => (
                                                <option key={ins.insurance_id} value={ins.insurance_id}>
                                                    {ins.name || ins.provider_name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={styles.infoText}>{profile.provider_name || "N/A"}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Policy Number</label>
                                    <div style={styles.infoText}>{profile.policy_number || "N/A"}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pharmacy Information */}
                    <Card>
                        <CardContent>
                            <div style={styles.section}>
                                <div style={styles.sectionTitle}>Pharmacy Information</div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Preferred Pharmacy</label>
                                    {editing ? (
                                        <select
                                            style={{
                                                padding: "10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ccc",
                                                width: "100%",
                                            }}
                                            value={formData.pharmacy_id}
                                            onChange={(e) =>
                                                handleInputChange("pharmacy_id", e.target.value)
                                            }
                                        >
                                            <option value="">Select Pharmacy</option>
                                            {pharmacies.map((pharm) => (
                                                <option key={pharm.pharmacy_id} value={pharm.pharmacy_id}>
                                                    {pharm.name || pharm.pharmacy_name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={styles.infoText}>{profile.pharmacy_name || "N/A"}</div>
                                    )}
                                </div>

                                {!editing && (
                                    <>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Pharmacy Location</label>
                                            <div style={styles.infoText}>
                                                {profile.pharmacy_location || "N/A"}
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Pharmacy Phone</label>
                                            <div style={styles.infoText}>
                                                {profile.pharmacy_phone || "N/A"}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
