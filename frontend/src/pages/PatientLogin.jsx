import React, { useState } from 'react';
import { patientLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

function PatientLogin() {
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await patientLogin(form);
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                navigate('/patient/dashboard'); // redirect after login
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="mb-4 text-center text-primary">Patient Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-3" style={{ color: 'red', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">
                            Username <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            name="user_name"
                            onChange={handleChange}
                            placeholder="Username"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">
                            Password <span style={{ color: 'red' }}>*</span>
                        </label>
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
                            onClick={() => navigate('/patient/signup')}
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
