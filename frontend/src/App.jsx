import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/SamplePage'
import QueryDemo from './pages/QueryDemo'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5004'

function HomePage(){
  const [health, setHealth] = React.useState(null)
  React.useEffect(()=>{
    axios.get(`${API_BASE}/api/health`).then(r=> setHealth(r.data)).catch(()=> setHealth(null))
  },[])

  return (
    <div>
      <h1>MediFlow</h1>
      <p>Backend health: {health ? JSON.stringify(health) : 'unreachable'}</p>
    </div>
  )
}

export default function App(){
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/sample" element={<Home/>} />
          <Route path="/queries" element={<QueryDemo/>} />
        </Routes>
      </div>
    </Router>
  )
}
