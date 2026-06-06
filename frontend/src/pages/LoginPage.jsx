import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // STOP the page from reloading!
    setError('');
    setLoading(true);

    console.log("Attempting to login with:", email); 

    try {
      // Make sure this port matches your backend (5001)
      const res = await axios.post('https://sweeply-garbage-reporting-system.onrender.com', {
        email,
        password,
      });

      console.log("FULL SERVER RESPONSE:", res.data); // 🔍 Debug log to see structure

      // 1. Get the Token
      const token = res.data.token;
      if (!token) {
        throw new Error("Login succeeded but no token was returned!");
      }
      localStorage.setItem('token', token);

      // 2. Safely find the User Data
      // Sometimes it's in res.data.user, sometimes just res.data
      const userData = res.data.user || res.data;

      // 3. Verify we have userType
      if (!userData || !userData.userType) {
        console.error("User data found but missing userType:", userData);
        throw new Error("Login failed: Could not determine user role (Citizen/Cleaner).");
      }

      console.log("User Type found:", userData.userType); 

      // 4. Save User and Redirect
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.userType === 'Cleaner') {
        navigate('/cleaner-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("Login Error:", err); 
      setLoading(false);
      
      // Show a better error message
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Server error. Is the backend running?');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* Simple icon directly in SVG */}
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sweeply</h1>
          <p className="text-gray-500">Cleanliness at your fingertips.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${loading ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-green-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;