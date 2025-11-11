import React, { useState } from 'react';
import { patientLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

function PatientLogin() {
    const [form, setForm] = useState({});
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await patientLogin(form);
            localStorage.setItem("token", res.data.token);
            alert("Login successful!");
            navigate('/patientdashboard'); // redirect after login
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="mb-4 text-center text-primary">Patient Login</h2>
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
                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Login
                    </button>
                    <div className="text-center">
                        <span>Don't have an account? </span>
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={() => navigate('/signup')}
                        >
                            Signup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PatientLogin;
