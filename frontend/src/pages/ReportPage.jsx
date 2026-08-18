import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

// --- IMPORTANT: CLOUDINARY DETAILS ---
const CLOUDINARY_CLOUD_NAME = 'dzqxzwkfg'; 
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; 

const ReportPage = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [locationLoading, setLocationLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const navigate = useNavigate();

  // --- THE FIX: GET LOCATION WITH FALLBACK ---
  const handleGetLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Using fallback.");
      // Fallback: [Longitude, Latitude]
      setLocation({ type: 'Point', coordinates: [80.5507, 16.2325] }); 
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // SUCCESS: Got real location
        setLocation({
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
        });
        setLocationLoading(false);
      },
      (error) => {
        // FAILURE: Mac/Browser blocked it. Use Campus Fallback!
        console.warn("Location blocked, using campus fallback.", error);
        alert("Unable to retrieve exact location. Using default campus testing location.");
        
        // Fallback coordinates (Longitude, Latitude)
        setLocation({
          type: 'Point',
          coordinates: [80.5507, 16.2325], 
        });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !image) {
      alert('Please get location and select an image first!');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Image to Cloudinary
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      // 2. THE FIX: Get User Token correctly
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in!');
        navigate('/login');
        return;
      }

      // 3. Send Report Data
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      };

      const reportData = {
        description,
        imageUrl,
        location,
      };

      await axios.post(
        `${API_URL}/reports`,
        reportData,
        config
      );

      setIsUploading(false);
      alert('Report Submitted Successfully!');
      navigate('/dashboard'); 
      
    } catch (error) {
      setIsUploading(false);
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Top Navigation Bar for the form */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6">
         <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
         </button>
      </div>

      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           </div>
           <h2 className="text-3xl font-bold text-gray-800">Report Garbage</h2>
           <p className="text-gray-500 mt-2">Help keep the community clean by submitting a photo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold uppercase mb-2">
              1. Upload Photo Proof
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="image" name="image" type="file" accept="image/*" className="sr-only" onChange={(e) => setImage(e.target.files[0])} required />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{image ? image.name : 'PNG, JPG, GIF up to 10MB'}</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold uppercase mb-2">
              2. Describe the Issue
            </label>
            <textarea
              id="description"
              rows="3"
              placeholder="e.g., Large pile of plastic bottles near the main entrance..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold uppercase mb-2">
              3. Pin Location
            </label>
            {!location ? (
               <button
                 type="button" 
                 onClick={handleGetLocation}
                 disabled={locationLoading}
                 className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-900 transition duration-300 disabled:opacity-50"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 {locationLoading ? 'Scanning...' : 'Detect Current Location'}
               </button>
            ) : (
               <div className="w-full flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium">
                  <div className="flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                     Location Acquired
                  </div>
                  <button type="button" onClick={() => setLocation(null)} className="text-sm underline hover:text-green-800">Retake</button>
               </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isUploading || locationLoading || !location} 
            className={`w-full font-bold py-4 px-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-2 text-lg ${(isUploading || locationLoading || !location) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'}`}
          >
            {isUploading ? (
               <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Uploading Report...
               </>
            ) : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;