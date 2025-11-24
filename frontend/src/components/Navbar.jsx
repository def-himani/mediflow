import React from 'react'
import { Link } from 'react-router-dom'
import { UserCircle } from "lucide-react";

export default function Navbar(){
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">MediFlow</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/sample">Sample Page</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/queries">Queries</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/patient/profile">
                <UserCircle size={34} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
