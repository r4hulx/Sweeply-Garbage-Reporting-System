import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import Navbar from "../components/Navbar";

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  // Modals
  const [selectedReport, setSelectedReport] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setEditName(user.fullName);
    }

    fetchMyReports(token);
  }, [navigate]);

  const fetchMyReports = async (token) => {
    try {
      // Notice we use /myreports here to only get this citizen's reports
      const response = await axios.get(
        `${API_URL}/reports/myreports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("REPORT RESPONSE:", response.data);
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD HELPER ---
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    
    // ⚠️ REPLACE WITH YOUR CLOUDINARY DETAILS (Same as Cleaner Dashboard)
    data.append("upload_preset", "ml_default"); 
    data.append("cloud_name", "dzqxzwkfg"); 

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/dzqxzwkfg/image/upload", data); 
      return res.data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploadingProfile(true);
    try {
      let imageUrl = currentUser.profileImage;
      if (editImage) {
        imageUrl = await uploadToCloudinary(editImage);
      }

      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/users/profile`, {
        fullName: editName,
        profileImage: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditingProfile(false);
      setUploadingProfile(false);
    } catch (error) {
      console.error(error);
      setUploadingProfile(false);
      alert("Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  // Stats Logic
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'Reported').length;
  const cleanedReports = reports.filter(r => r.status === 'Cleaned').length;

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status.toLowerCase() === filter;
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- Navbar --- */}
      <Navbar
  title="Sweeply Citizen"
  user={currentUser}
  onProfileClick={() => setShowProfile(true)}
  logo={
    <svg
      className="w-8 h-8 text-green-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3.055 11 H5 a2 2 0 0 1 2 2 v1 a2 2 0 0 0 2 2 a2 2 0 0 1 2 2 v2.945 M8 3.935 V5.5 A2.5 2.5 0 0 0 10.5 8 h.5 a2 2 0 0 1 2 2 a2 2 0 1 0 4 0 a2 2 0 0 1 2 -2 h1.064 M15 20.488 V18 a2 2 0 0 1 2 -2 h3.064 M21 12 a9 9 0 1 1 -18 0 a9 9 0 0 1 18 0 z"
      />
    </svg>
  }
/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Hero Section & Action Button --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
           <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Citizen'}! 👋</h1>
              <p className="text-gray-500">Thank you for helping keep our community clean. Your reports make a real difference.</p>
           </div>
           <button 
             onClick={() => navigate('/report')}
             className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             Report Garbage
           </button>
        </div>

        {/* --- Stats Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Total Reported</p>
              <p className="text-3xl font-bold text-gray-800">{totalReports}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-500">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Awaiting Cleanup</p>
              <p className="text-3xl font-bold text-gray-800">{pendingReports}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Successfully Cleaned</p>
              <p className="text-3xl font-bold text-green-500">{cleanedReports}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* --- Filters & Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">My Reports History</h2>
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            {['all', 'reported', 'cleaned'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f === 'reported' ? 'Pending' : f}
              </button>
            ))}
          </div>
        </div>

        {/* --- Reports Grid --- */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <p className="text-gray-500 text-lg">You haven't made any reports in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col group">
                <div className="h-48 bg-gray-200 relative cursor-pointer" onClick={() => setSelectedReport(report)}>
                  <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">View Details</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${report.status === 'Cleaned' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                      {report.status === 'Reported' ? 'Pending' : report.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 capitalize mb-1">{report.description}</h3>
                  <div className="flex items-center text-gray-500 text-xs mb-4">
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="mt-auto w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                  >
                    View Status Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: REPORT PREVIEW (With Proof Viewing) --- */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Report Status</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">✕</button>
            </div>

            <div className="p-6">
              {/* Image Compare Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div className="rounded-xl overflow-hidden border border-gray-200 relative">
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold backdrop-blur-sm">When Reported</div>
                    <img src={selectedReport.imageUrl} alt="Before" className="w-full h-48 object-cover" />
                 </div>
                 
                 {selectedReport.status === 'Cleaned' ? (
                    <div className="rounded-xl overflow-hidden border border-green-300 relative ring-2 ring-green-100">
                       <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold shadow-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> After Cleanup
                       </div>
                       <img src={selectedReport.cleanedImageUrl || 'https://via.placeholder.com/400x300?text=Cleanup+Verified'} alt="After" className="w-full h-48 object-cover" />
                    </div>
                 ) : (
                    <div className="rounded-xl overflow-hidden border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center h-48 text-gray-400">
                       <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       <span className="text-sm font-medium">Awaiting Cleanup</span>
                    </div>
                 )}
              </div>
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                  <p className="text-gray-800 font-medium mt-1">{selectedReport.description}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location Coordinates</label>
                  <div className="flex items-center gap-4 mt-1">
                     <span className="text-sm text-gray-600 font-mono bg-white px-2 py-1 border border-gray-200 rounded">
                        {selectedReport.location.coordinates[1].toFixed(4)}, {selectedReport.location.coordinates[0].toFixed(4)}
                     </span>
                     <button 
                       onClick={() => openGoogleMaps(selectedReport.location.coordinates[1], selectedReport.location.coordinates[0])}
                       className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                     >
                       View on Map
                     </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedReport(null)} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: USER PROFILE & EDIT --- */}
      {showProfile && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 p-6 text-center relative">
               <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">✕</button>
               
               <div className="relative inline-block">
                  <img 
                    src={isEditingProfile && editImage ? URL.createObjectURL(editImage) : (currentUser.profileImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg")} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4 bg-white" 
                  />
                  {isEditingProfile && (
                     <label className="absolute bottom-4 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-black transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} />
                     </label>
                  )}
               </div>
            </div>

            <div className="p-6">
              {!isEditingProfile ? (
                 <div className="space-y-4">
                    <div className="text-center">
                       <h3 className="text-xl font-bold text-gray-800">{currentUser.fullName}</h3>
                       <p className="text-sm text-gray-500">{currentUser.email}</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Citizen Reporter</span>
                    </div>
                    <button 
                       onClick={() => setIsEditingProfile(true)}
                       className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors"
                    >
                       Edit Profile
                    </button>
                    <button onClick={handleLogout} className="w-full py-2 text-red-500 hover:bg-red-50 font-bold rounded-lg transition-colors border border-transparent hover:border-red-100">
                       Log Out
                    </button>
                 </div>
              ) : (
                 <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                       <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                       />
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                       <button type="submit" disabled={uploadingProfile} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                          {uploadingProfile ? 'Saving...' : 'Save Changes'}
                       </button>
                    </div>
                 </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;