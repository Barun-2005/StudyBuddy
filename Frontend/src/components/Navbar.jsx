import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { MessageSquare, Bell, Sun, Moon, LogOut, User, Settings, Calendar } from "lucide-react";
import NotificationModal from "./NotificationModal";
import UserProfileModal from "./UserProfileModal";
import { axiosInstance } from "../lib/axios";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const toggleTheme = () => {
    // You can customize which themes to use for light/dark mode
    const lightTheme = 'corporate';
    const darkTheme = 'coffee';
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get("/friendRequests/pendingRequests");
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    };

    if (authUser) {
      fetchPendingRequests();
    }
  }, [authUser]);

  // Add animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
      }
      
      .animate-slideIn {
        animation: slideIn 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  return (
    <>
      <nav className="navbar bg-base-100 border-b border-base-200 fixed top-0 z-30 backdrop-blur-md bg-base-100/80 px-4">
        <div className="container mx-auto">
          <div className="flex-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
                <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  StudyBuddy
                </span>
                <span className="text-xs text-base-content/60 -mt-1">Connect & Learn</span>
              </div>
            </Link>
          </div>
          
          {authUser && (
            <div className="flex-none flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'corporate' ? (
                  <Moon className="w-5 h-5 hover:rotate-12 transition-transform duration-300" />
                ) : (
                  <Sun className="w-5 h-5 hover:rotate-90 transition-transform duration-300" />
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="btn btn-circle btn-sm btn-ghost hover:bg-base-200 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <div className="indicator">
                    <Bell className="w-5 h-5" />
                    {pendingRequests.length > 0 && (
                      <span className="badge badge-xs badge-primary indicator-item animate-pulse">
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                </button>
                
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] animate-fadeIn"
                      onClick={() => setShowNotifications(false)}
                      style={{
                        animation: "fadeIn 0.2s ease-out",
                      }}
                    />
                    <div className="absolute right-0 mt-2 z-[90]">
                      <NotificationModal 
                        onClose={() => setShowNotifications(false)}
                        pendingRequests={pendingRequests}
                        setPendingRequests={setPendingRequests}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="dropdown dropdown-end">
                <div 
                  tabIndex={0} 
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img 
                      src={authUser?.profilePic || "/avatar.png"} 
                      alt="profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <ul className="mt-3 z-[70] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-200">
                  <li>
                    <Link to="/profile" className="flex items-center gap-2 p-3 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/sessions" className="flex items-center gap-2 p-3 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Calendar className="w-4 h-4" />
                      Sessions
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="flex items-center gap-2 p-3 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <button 
                      onClick={logout} 
                      className="flex items-center gap-2 p-3 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="h-16"></div>

      {selectedUser && (
        <UserProfileModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
        />
      )}
    </>
  );
};

export default Navbar;




