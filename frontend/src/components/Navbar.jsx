import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserCircle } from "lucide-react";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is logged in
    const patientToken = localStorage.getItem('token');
    const physicianToken = localStorage.getItem('physicianToken');
    const isLoggedIn = !!patientToken || !!physicianToken;
    const isPatient = !!patientToken;
    const isPhysician = !!physicianToken;

    // Routes where navbar should show login/signup
    const authRoutes = ['/login', '/signup', '/patient/signup', '/physicianlogin', '/physiciansignup', '/physician/login'];
    const isAuthPage = authRoutes.includes(location.pathname);

    const handleMediFlowClick = (e) => {
        e.preventDefault();
        if (isPatient) {
            navigate('/patient/dashboard');
        } else if (isPhysician) {
            navigate('/physiciandashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="container-fluid">
                <Link className="navbar-brand" to="/" onClick={handleMediFlowClick} style={{ cursor: 'pointer' }}>
                    MediFlow
                </Link>

                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        {isLoggedIn && (
                            <li className="nav-item">
                                <Link className="nav-link" to={isPatient ? "/patient/profile" : "/physiciandashboard"}>
                                    <UserCircle size={34} />
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
