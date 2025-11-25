import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Routes where navbar items should be hidden
  const authRoutes = ['/login', '/signup', '/patient/signup', '/physicianlogin', '/physiciansignup', '/physician/login'];
  const isAuthPage = authRoutes.includes(location.pathname);

  // Check if user is logged in (you can adjust this based on your auth logic)
  const isLoggedIn = localStorage.getItem('token') || sessionStorage.getItem('user');

  const handleLogout = () => {
    // Clear authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Show logout message
    alert('You have been logged out successfully');
    
    // Redirect to landing page
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">MediFlow</Link>
        
        {/* Only show nav items if not on auth pages */}
        {!isAuthPage && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/patient/profile">
                      <UserCircle size={34} />
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="btn btn-link nav-link" 
                      onClick={handleLogout}
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <LogOut size={24} />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}