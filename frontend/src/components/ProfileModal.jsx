import React from "react";

const ProfileModal = ({
  user,
  isOpen,
  onClose,
  onEditProfile,
  onLogout,
  headerColor = "bg-green-600",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[390px] overflow-hidden">

        <div className={`${headerColor} h-40 relative`}>
          <button
            onClick={onClose}
            className="absolute right-5 top-4 text-white text-3xl"
          >
            ×
          </button>

          <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
            <img
              src={user?.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
            />
          </div>
        </div>

        <div className="pt-16 pb-8 px-8 text-center">
          <h2 className="text-3xl font-bold">
            {user?.fullName}
          </h2>

          <p className="text-gray-500 mt-2">
            {user?.email}
          </p>

          <div className="mt-3">
            <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              {user?.userType}
            </span>
          </div>

          <button
            onClick={onEditProfile}
            className="w-full mt-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold"
          >
            Edit Profile
          </button>

          <button
            onClick={onLogout}
            className="w-full mt-4 py-3 text-red-500 font-semibold"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;