import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 1. We've moved the form component OUTSIDE.
// It now receives all its data and functions as props.
const RegistrationForm = ({ userType, formData, handleInputChange, handleSubmit, loading }) => {
  return (
    <form onSubmit={(e) => handleSubmit(e, userType)}>
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
        <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
        <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>
      {userType === 'Cleaner' && (
        <div className="mb-4">
          <label htmlFor="employeeId" className="block text-gray-700 text-sm font-semibold mb-2">Employee ID</label>
          <input type="text" id="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
        </div>
      )}
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
        <input type="password" id="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50">
        {loading ? 'Registering...' : 'Create Account'}
      </button>
    </form>
  );
};


// This is your main page component
const RegisterPage = () => {
  const [step, setStep] = useState('selection');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '', 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e, userType) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: userType,
      };
      
      if (userType === 'Cleaner') {
        registrationData.employeeId = formData.employeeId;
      }

      await axios.post('https://sweeply-garbage-reporting-system.onrender.com', registrationData);
      
      setLoading(false);
      alert('Registration successful! Please log in.');
      navigate('/'); 

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {step === 'selection' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Join Sweeply</h2>
            <p className="text-center text-gray-600 mb-6">First, tell us who you are.</p>
            <div className="space-y-4">
              <div onClick={() => setStep('citizen')} className="border-2 border-gray-200 p-6 rounded-lg text-center hover:border-green-500 hover:bg-green-50 cursor-pointer transition">
                <h3 className="text-xl font-semibold">I am a Citizen</h3>
                <p className="text-gray-500 mt-2">I want to report garbage in my area.</p>
              </div>
              <div onClick={() => setStep('cleaner')} className="border-2 border-gray-200 p-6 rounded-lg text-center hover:border-green-500 hover:bg-green-50 cursor-pointer transition">
                <h3 className="text-xl font-semibold">I am a Cleaner</h3>
                <p className="text-gray-500 mt-2">I am part of a team that cleans garbage.</p>
              </div>
            </div>
          </>
        )}

        {step === 'citizen' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Citizen Sign Up</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {/* 2. Now we pass the state and handlers down as props */}
            <RegistrationForm 
              userType="Citizen"
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </>
        )}

        {step === 'cleaner' && (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Cleaner Sign Up</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {/* 2. Now we pass the state and handlers down as props */}
            <RegistrationForm 
              userType="Cleaner"
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-green-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;