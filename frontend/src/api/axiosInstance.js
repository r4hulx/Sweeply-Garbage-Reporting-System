import axios from 'axios';

// Single source of truth for the backend URL.
// Set VITE_API_URL in frontend/.env — defaults to your local backend
// so `npm run dev` never has to hit the (slow, free-tier) Render server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

export default api;
