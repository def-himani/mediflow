import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box'
  };

  const headerStyle = {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
    flexShrink: 0
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const sectionStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'center',
    boxSizing: 'border-box',
    overflow: 'auto'
  };

  const leftSectionStyle = {
    ...sectionStyle,
    backgroundColor: '#e8f5e9',
    borderRight: '2px solid #ddd'
  };

  const rightSectionStyle = {
    ...sectionStyle,
    backgroundColor: '#e3f2fd'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333'
  };

  const benefitsListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: '20px 0',
    fontSize: '16px',
    color: '#555'
  };

  const benefitItemStyle = {
    margin: '12px 0',
    paddingLeft: '20px',
    position: 'relative'
  };

  const buttonStyle = {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    margin: '8px',
    transition: 'all 0.3s',
    minWidth: '120px'
  };

  const greenButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '32px', color: '#007bff' }}>Welcome to MediFlow</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', color: '#666' }}>
          Your comprehensive healthcare management platform
        </p>
      </div>

      <div style={contentStyle}>
        {/* Left Section - Patient */}
        <div style={leftSectionStyle}>
          <h2 style={titleStyle}>For Patients</h2>
          <ul style={benefitsListStyle}>
            <li style={benefitItemStyle}>✓ Manage your health records</li>
            <li style={benefitItemStyle}>✓ Track activity and vitals</li>
            <li style={benefitItemStyle}>✓ Book appointments easily</li>
            <li style={benefitItemStyle}>✓ Access medical history</li>
          </ul>
          <div>
            <button
              style={primaryButtonStyle}
              onClick={() => navigate('/login')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Login
            </button>
            <button
              style={greenButtonStyle}
              onClick={() => navigate('/patient/signup')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Right Section - Physician */}
        <div style={rightSectionStyle}>
          <h2 style={titleStyle}>For Physicians</h2>
          <ul style={benefitsListStyle}>
            <li style={benefitItemStyle}>✓ Manage patient records</li>
            <li style={benefitItemStyle}>✓ View appointment schedules</li>
            <li style={benefitItemStyle}>✓ Access patient activity logs</li>
            <li style={benefitItemStyle}>✓ Create health records</li>
          </ul>
          <div>
            <button
              style={primaryButtonStyle}
              onClick={() => navigate('/physician/login')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Login
            </button>
            <button
              style={greenButtonStyle}
              onClick={() => navigate('/physiciansignup')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
