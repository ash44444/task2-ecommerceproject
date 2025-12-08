// src/api/axiosClient.js
import axios from "axios";

// Base URL for the API
const BASE = import.meta.env.VITE_API_BASE_URL;

// Add /api automatically
const axiosClient = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

// Debug to check
console.log("AXIOS BASE URL:", axiosClient.defaults.baseURL);

export default axiosClient;
