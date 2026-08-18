import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CleanerDashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modals State
  const [selectedReport, setSelectedReport] = useState(null); 
  const [showProfile, setShowProfile] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false); // New: For Proof Upload

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  // Cleaning Proof State
  const [proofImage, setProofImage] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

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
      setEditName(user.fullName); // Pre-fill edit form
    }

    fetchReports(token);
  }, [navigate]);

  const fetchReports = async (token) => {
    try {
      const response = await api.get('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("REPORT DATA:", response.data);
      console.log("IS ARRAY:", Array.isArray(response.data));

      setReports(Array.isArray(response.data) ? response.data : []);

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
    data.append("upload_preset", "ml_default"); // Make sure this matches your Cloudinary preset!
    data.append("cloud_name", "dzqxzwkfg"); // REPLACE WITH YOUR CLOUD NAME

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/dzqxzwkfg/image/upload", data); // REPLACE HERE TOO
      return res.data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  // --- ACTIONS ---

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploadingProfile(true);
    try {
      let imageUrl = currentUser.profileImage;
      if (editImage) {
        imageUrl = await uploadToCloudinary(editImage);
      }

      const token = localStorage.getItem('token');
      const res = await api.put('/api/users/profile', {
        fullName: editName,
        profileImage: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Local State
      setCurrentUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditingProfile(false);
      setUploadingProfile(false);
      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error(error);
      setUploadingProfile(false);
      alert("Failed to update profile.");
    }
  };

  const handleMarkCleaned = async () => {
    if (!proofImage) {
      alert("Please upload a proof picture!");
      return;
    }
    setUploadingProof(true);

    try {
      const imageUrl = await uploadToCloudinary(proofImage);
      const token = localStorage.getItem('token');
      
      await api.put(
        `/api/reports/${selectedReport._id}`,
        { 
          status: 'Cleaned',
          cleanedImageUrl: imageUrl // Send proof to backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI
      setReports(reports.map((r) => 
        r._id === selectedReport._id ? { ...r, status: 'Cleaned', cleanedImageUrl: imageUrl } : r
      ));
      
      setUploadingProof(false);
      setShowCleanModal(false);
      setSelectedReport(null);
      setProofImage(null); // Reset
    } catch (error) {
      console.error(error);
      setUploadingProof(false);
      alert("Failed to submit proof.");
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

  // --- FILTERING ---
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status.toLowerCase() === filter;
  });

  const pendingCount = reports.filter(r => r.status === 'Reported').length;
  const cleanedCount = reports.filter(r => r.status === 'Cleaned').length;

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              <span className="font-bold text-xl text-green-700">Sweeply<span className="text-gray-500 font-normal">Cleaner</span></span>
            </div>
            
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowProfile(true)}>
              <span className="hidden md:block text-sm font-semibold text-gray-700">{currentUser?.fullName}</span>
              <img 
                src={currentUser?.profileImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                alt="Profile" 
                className="h-10 w-10 rounded-full object-cover border-2 border-green-100"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <p className="text-sm text-gray-500 font-bold uppercase">Pending</p>
            <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-bold uppercase">Cleaned</p>
            <p className="text-3xl font-bold text-gray-800">{cleanedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-bold uppercase">Total</p>
            <p className="text-3xl font-bold text-gray-800">{reports.length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'reported', 'cleaned'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${filter === f ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {f === 'reported' ? 'Pending' : f}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="h-48 relative cursor-pointer" onClick={() => setSelectedReport(report)}>
                <img src={report.imageUrl} alt="Garbage" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-black/50 backdrop-blur-md">
                  {report.status}
                </div>
                {/* Proof Overlay if Cleaned */}
                {report.status === 'Cleaned' && report.cleanedImageUrl && (
                   <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Verified
                   </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{report.description}</h3>
                <p className="text-xs text-gray-500 mb-4">{new Date(report.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                   <button onClick={() => setSelectedReport(report)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                     Details
                   </button>
                   {report.status === 'Reported' && (
                     <button 
                       onClick={() => { setSelectedReport(report); setShowCleanModal(true); }}
                       className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold text-white shadow-green-200 shadow-lg"
                     >
                       Clean It
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL: REPORT DETAILS --- */}
      {selectedReport && !showCleanModal && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">✕</button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="rounded-xl overflow-hidden border border-gray-200">
                      <p className="bg-gray-100 text-xs font-bold text-gray-500 p-2 text-center uppercase">Before</p>
                      <img src={selectedReport.imageUrl} className="w-full h-48 object-cover" alt="Before" />
                   </div>
                   {selectedReport.cleanedImageUrl && (
                     <div className="rounded-xl overflow-hidden border border-green-200 ring-2 ring-green-100">
                        <p className="bg-green-50 text-xs font-bold text-green-600 p-2 text-center uppercase flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> After (Proof)
                        </p>
                        <img src={selectedReport.cleanedImageUrl} className="w-full h-48 object-cover" alt="After" />
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                      <p className="text-gray-800 font-medium">{selectedReport.description}</p>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                      <button 
                        onClick={() => openGoogleMaps(selectedReport.location.coordinates[1], selectedReport.location.coordinates[0])}
                        className="flex items-center gap-2 text-blue-600 font-semibold mt-1 hover:underline"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         Open Maps Navigation
                      </button>
                   </div>
                </div>
              </div>
            </div>
            {selectedReport.status === 'Reported' && (
              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button 
                  onClick={() => setShowCleanModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Start Cleaning Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: PROOF UPLOAD --- */}
      {showCleanModal && selectedReport && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95">
               <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Proof of Work</h3>
               <p className="text-sm text-gray-500 mb-6">Please verify that the area has been cleaned by uploading a photo.</p>
               
               <div className="mb-6">
                  <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-400 transition-colors">
                     {proofImage ? (
                        <img src={URL.createObjectURL(proofImage)} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                     ) : (
                        <>
                           <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           <span className="text-sm text-gray-500 font-medium">Click to select photo</span>
                        </>
                     )}
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofImage(e.target.files[0])} />
                  </label>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => { setShowCleanModal(false); setProofImage(null); }} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                  <button 
                     onClick={handleMarkCleaned} 
                     disabled={uploadingProof}
                     className={`flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg flex justify-center items-center ${uploadingProof ? 'opacity-70 cursor-wait' : 'hover:bg-green-700'}`}
                  >
                     {uploadingProof ? 'Uploading...' : 'Submit Proof'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- MODAL: USER PROFILE & EDIT --- */}
      {showProfile && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-green-600 p-6 text-center relative">
               {/* Close Button */}
               <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">✕</button>
               
               {/* Avatar */}
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
                       <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Cleaner</span>
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
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" 
                       />
                    </div>
                    <div className="flex gap-2 pt-2">
                       <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                       <button type="submit" disabled={uploadingProfile} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
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

export default CleanerDashboardPage;