import React, { useState } from 'react';
import { physicianSignup } from '../services/api';
import { useNavigate } from 'react-router-dom';

function PhysicianSignup() {
    const [form, setForm] = useState({});
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await physicianSignup(form);
            // Redirect directly to login page after successful signup
            navigate('/physician/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 className="mb-4 text-center text-primary">Physician Signup</h2>
                <form onSubmit={handleSubmit}>
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
                    <div className="mb-3">
                        <label className="form-label">
                            First Name <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            name="first_name"
                            onChange={handleChange}
                            placeholder="First Name"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">
                            Last Name <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            name="last_name"
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">
                            Email <span style={{ color: 'red' }}>*</span>
                        </label>
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
                        <label className="form-label">
                            Phone <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            name="phone"
                            onChange={handleChange}
                            placeholder="Phone"
                            className="form-control"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Signup
                    </button>
                    <div className="text-center">
                        <span>Already have an account? </span>
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={() => navigate('/physician/login')}
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PhysicianSignup;
