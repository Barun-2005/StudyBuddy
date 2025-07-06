import { X, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios"; // Changed from default import
import toast from "react-hot-toast";
import { useState } from "react";
import UserProfileModal from "../components/UserProfileModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleVideoCall = async () => {
    try {
      const res = await axiosInstance.post("/calls/initiate", {
        recipientId: selectedUser._id
      });

      if (res.data) {
        navigate("/videoCall", { 
          state: { 
            selectedUser,
            roomId: res.data.roomId 
          } 
        });
      }
    } catch (error) {
      toast.error("Failed to initiate video call");
    }
  };

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar cursor-pointer" onClick={() => setShowProfile(true)}>
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Add Video Call Button */}
            <button onClick={handleVideoCall} className="btn btn-sm">
              <Video className="w-5 h-5" />
            </button>
            <button onClick={() => setSelectedUser(null)}>
              <X />
            </button>
          </div>
        </div>
      </div>

      {showProfile && (
        <UserProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={selectedUser}
          showUnfriend={true}  // Make sure this is set to true
        />
      )}
    </>
  );
};

export default ChatHeader;




