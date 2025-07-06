import React, { useState } from "react";
import { X, UserIcon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import UserProfileModal from "./UserProfileModal";

const NotificationModal = ({ onClose, pendingRequests, setPendingRequests }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAcceptRequest = async (fromUserId) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await axiosInstance.post("/api/friendRequests/respondToFriendRequest", {
        fromUserId,
        response: "accepted"
      });

      if (response.status === 200) {
        setPendingRequests(prev => prev.filter(req => req.fromUserId._id !== fromUserId));
        toast.success("Friend request accepted!");
        
        // Optionally refresh the friends list if needed
        // await refreshFriendsList();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error.response?.data?.message || "Failed to accept request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineRequest = async (fromUserId) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await axiosInstance.post("/api/friendRequests/respondToFriendRequest", {
        fromUserId,
        response: "declined"
      });

      if (response.status === 200) {
        setPendingRequests(prev => prev.filter(req => req.fromUserId._id !== fromUserId));
        toast.success("Friend request declined");
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("Failed to decline request");
    } finally {
      setIsProcessing(false);
    }
  };

  const viewUserProfile = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      <div 
        className="w-96 bg-base-100 rounded-xl shadow-2xl border border-base-200 overflow-hidden animate-slideIn"
        onClick={e => e.stopPropagation()}
        style={{
          animation: "slideIn 0.3s ease-out",
        }}
      >
        <div className="p-4 border-b border-base-200 bg-base-100 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div 
                  key={request._id} 
                  className="flex items-center gap-4 p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors duration-200"
                >
                  <div 
                    className="flex-shrink-0 cursor-pointer relative group"
                    onClick={() => viewUserProfile(request.fromUserId)}
                  >
                    <img
                      src={request.fromUserId.profilePic || "/avatar.png"}
                      alt={request.fromUserId.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary group-hover:border-primary-focus transition-all duration-200"
                    />
                    <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <UserIcon className="w-5 h-5 text-primary-content" />
                    </div>
                  </div>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => viewUserProfile(request.fromUserId)}
                  >
                    <p className="font-medium truncate">
                      {request.fromUserId.fullName}
                    </p>
                    <p className="text-sm text-base-content/70">
                      Sent you a friend request
                    </p>
                  </div>
                  <div className="flex gap-2 z-10">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAcceptRequest(request.fromUserId._id)}
                      className="btn btn-primary btn-sm hover:bg-primary-focus transition-colors duration-200"
                    >
                      Accept
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleDeclineRequest(request.fromUserId._id)}
                      className="btn btn-ghost btn-sm hover:bg-base-300 transition-colors duration-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-base-content/60 py-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-base-content/40" />
                </div>
              </div>
              <p className="font-medium">No new notifications</p>
              <p className="text-sm">Friend requests will appear here</p>
            </div>
          )}
        </div>
      </div>

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

export default NotificationModal;
