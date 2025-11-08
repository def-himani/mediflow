import React from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5004'

export default function QueryDemo(){
  const [rows, setRows] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(()=>{
    setLoading(true)
    axios.get(`${API_BASE}/api/query_file`, { params: { file: 'queries/get_users.sql' } })
      .then(r => {
        setRows(r.data.results)
      })
      .catch(e => setError(e.toString()))
      .finally(()=> setLoading(false))
  },[])

  return (
    <div>
      <h2>Query Demo</h2>
      <p>This page fetches `backend/sql/queries/get_users.sql` via <code>/api/query_file</code>.</p>
      {loading && <p>Loading…</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {rows && (
        <table className="table table-striped">
          <thead>
            <tr>
              {Object.keys(rows[0] || {}).map(k => <th key={k}>{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {Object.values(r).map((v,i)=> <td key={i}>{String(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
