// API Configuration
// Automatically switches between development and production URLs

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://study-buddy-api-backend.netlify.app' // Production backend URL
    : 'http://localhost:3000' // Development backend URL
);

export default API_BASE_URL;

// Usage in components:
// import API_BASE_URL from '../config/api';
// axios.get(`${API_BASE_URL}/api/endpoint`)
