import React from "react";

const Navbar = ({
  logo,
  title,
  user,
  onProfileClick,
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          {logo}
          <h1 className="text-2xl font-bold text-green-600">
            {title}
          </h1>
        </div>

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="text-right">
            <p className="font-semibold">
              {user?.fullName}
            </p>

            <p className="text-sm text-gray-500">
              View Profile
            </p>
          </div>

          <img
            src={user?.profileImage}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-green-200 object-cover"
          />
        </div>

      </div>
    </header>
  );
};

export default Navbar;