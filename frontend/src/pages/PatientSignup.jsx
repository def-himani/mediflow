import React, { useState, useEffect } from "react";
import { patientSignup, getInsurances, getPharmacies } from "../services/api";
import { useNavigate } from "react-router-dom";

function PatientSignup() {
  const [form, setForm] = useState({});
  const [insurances, setInsurances] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const navigate = useNavigate();

  console.log(insurances);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Fetch insurance and pharmacy options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ins = await getInsurances();
        console.log(ins.data);
        setInsurances(ins.data);

        const pharm = await getPharmacies();
        setPharmacies(pharm.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await patientSignup(form);
      alert(res.data.message);
      navigate("/login"); // redirect to login after successful signup
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h2 className="mb-4 text-center text-primary">Patient Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              name="user_name"
              onChange={handleChange}
              placeholder="Username"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Password"
              className="form-control"
              required
            />
          </div>
          <div className="row mb-3">
            <div className="col">
              <input
                name="first_name"
                onChange={handleChange}
                placeholder="First Name"
                className="form-control"
                required
              />
            </div>
            <div className="col">
              <input
                name="last_name"
                onChange={handleChange}
                placeholder="Last Name"
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="phone"
              onChange={handleChange}
              placeholder="Phone"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <input
              name="date_of_birth"
              type="date"
              onChange={handleChange}
              placeholder="Date of Birth"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <select
              name="gender"
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Gender</option>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
          <div className="mb-3">
            <input
              name="address"
              onChange={handleChange}
              placeholder="Address"
              className="form-control"
            />
          </div>
          <div className="row mb-3">
            <div className="col">
              <select
                name="insurance_id"
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Insurance</option>
                {insurances.map((i) => (
                  <option key={i.insurance_id} value={i.insurance_id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col">
              <select
                name="pharmacy_id"
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Pharmacy</option>
                {pharmacies.map((p) => (
                  <option key={p.pharmacy_id} value={p.pharmacy_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <input
              name="emergency_contact"
              onChange={handleChange}
              placeholder="Emergency Contact"
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Signup
          </button>
          <div className="text-center">
            <span>Have an account? </span>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientSignup;
