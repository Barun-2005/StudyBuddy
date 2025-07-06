import React, { useEffect, useState } from "react";
import { X, Star, Book, School, Calendar, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

const UserProfileModal = ({ isOpen, onClose, user, showUnfriend = false }) => {
  const navigate = useNavigate();
  const [fullUserData, setFullUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUnfriending, setIsUnfriending] = useState(false);
  const { setSelectedUser } = useChatStore();
  
  const handleUnfriend = () => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium">Are you sure you want to unfriend this user?</p>
          <p className="text-sm text-base-content/70">This will delete your chat history.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setIsUnfriending(true);
              try {
                const response = await axiosInstance.post(`/api/friends/unfriend/${displayUser._id}`);
                if (response.status === 200) {
                  setSelectedUser(null);
                  onClose();
                  // Refresh chat users list
                  await useChatStore.getState().getUsers();
                  toast.success("User unfriended successfully");
                }
              } catch (error) {
                toast.error("Failed to unfriend user");
              } finally {
                setIsUnfriending(false);
              }
            }}
            className="btn btn-error btn-sm"
          >
            Unfriend
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  useEffect(() => {
    const fetchCompleteUserData = async () => {
      if (!isOpen || !user || !user._id) return;
      
      setLoading(true);
      try {
        // Use the studyBuddy endpoint to get complete user data
        const response = await axiosInstance.get(`/studyBuddy/user/${user._id}`);
        if (response.data) {
          setFullUserData(response.data);
        } else {
          // Fallback to basic user endpoint if studyBuddy endpoint fails
          const basicResponse = await axiosInstance.get(`/auth/user/${user._id}`);
          setFullUserData(basicResponse.data);
        }
      } catch (error) {
        console.error("Error fetching complete user data:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompleteUserData();
  }, [isOpen, user]);
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  if (!isOpen || !user) return null;
  
  // Use fetched data or fall back to passed user data
  const displayUser = fullUserData || user;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* Container div for proper stacking */}
        <div className="relative">
          {/* Header with gradient - explicitly set to lower z-index */}
          <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10" style={{ position: 'relative', zIndex: 1 }}>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-base-100/50 hover:bg-base-100"
              style={{ zIndex: 3 }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Image - explicitly set to higher z-index */}
          <div className="absolute left-0 right-0 top-16 flex justify-center" style={{ zIndex: 2 }}>
            <div className="relative">
              <img
                src={displayUser.profilePic || "/avatar.png"}
                alt={displayUser.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-base-100 shadow-lg"
              />
              {displayUser.rating !== undefined && (
                <div className="absolute -bottom-2 right-0 bg-warning text-warning-content rounded-full px-2 py-0.5 text-sm font-medium flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{displayUser.rating || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar">
            {/* Profile Content - added top padding to account for the image */}
            <div className="px-6 pt-20">
              {/* User Info */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-0.5">{displayUser.fullName}</h2>
                <p className="text-base-content/60 text-sm mb-3">{displayUser.email}</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/reviews/${displayUser._id}`);
                  }}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <Star className="w-4 h-4" />
                  View All Reviews
                </button>
              </div>

              {/* User Details Grid - More compact */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {displayUser.class && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <School className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Class</p>
                    </div>
                    <p className="text-sm text-base-content/70">{displayUser.class}</p>
                  </div>
                )}
                {displayUser.exam && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Book className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Exam</p>
                    </div>
                    <p className="text-sm text-base-content/70">{displayUser.exam}</p>
                  </div>
                )}
                {displayUser.studyPreferences && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Study</p>
                    </div>
                    <p className="text-sm text-base-content/70">{displayUser.studyPreferences}</p>
                  </div>
                )}
                {displayUser.availability && (
                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Available</p>
                    </div>
                    <p className="text-sm text-base-content/70">{displayUser.availability}</p>
                  </div>
                )}
              </div>

              {/* Subjects - More compact */}
              {displayUser.subjects?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {displayUser.subjects.map((subject, index) => (
                      <span 
                        key={index}
                        className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unfriend Button - Only shown in chat */}
              {showUnfriend && (
                <div className="mt-4 pb-4">
                  <button
                    onClick={handleUnfriend}
                    disabled={isUnfriending}
                    className="btn btn-error btn-outline btn-sm w-full"
                  >
                    {isUnfriending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Unfriend User
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default UserProfileModal;



