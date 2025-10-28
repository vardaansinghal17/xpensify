import React, { useContext, useState } from 'react'
import { SIDE_MENU_DATA } from '../../utils/data'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from "react-router-dom"
import CharAvatar from '../Cards/CharAvatar'

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleClick = (route) => {
    if (route === "/logout") {
      setShowLogoutDialog(true); // show confirmation dialog
      return;
    }
    navigate(route);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    clearUser();
    setShowLogoutDialog(false);
    navigate("/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      {/* --- Profile Section --- */}
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>

      {/* --- Menu Buttons --- */}
      {SIDE_MENU_DATA.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu === item.label
              ? "text-white bg-[#875cf5]"
              : "text-gray-700 hover:bg-gray-100"
          } py-3 px-6 rounded-lg mb-3 transition-colors duration-200`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}

      {/* --- Logout Confirmation Dialog --- */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-100 text-center">
            <h2 className="text-lg font-semibold mb-2">
              Are you sure you want to logout?
            </h2>
            <p className="text-gray-500 mb-6">You’ll be redirected to login.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
