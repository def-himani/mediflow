import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5004'

export default axios.create({
  baseURL: API_BASE,
  timeout: 5000,
})
