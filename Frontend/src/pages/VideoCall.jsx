import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Mic, MicOff, Camera, CameraOff, Monitor, PhoneOff } from 'lucide-react';
import { generateJitsiJWT } from '../utils/jitsi';

const VideoCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedUser, roomId } = location.state || {};
  const { socket } = useAuthStore();

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (!selectedUser || !roomId) {
      navigate("/chat");
      return;
    }

    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet API not loaded.");
      return;
    }

    const domain = "8x8.vc";
    const appId = "vpaas-magic-cookie-c2a8296ccab645118b3a28a65cfc7974";
    
    const options = {
      roomName: `${appId}/${roomId}`,
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        defaultLanguage: 'en',
        filmstrip: {
          enabled: true,
          height: 90,
        },
        constraints: {
          video: {
            height: {
              ideal: 720,
              max: 720,
              min: 180
            }
          }
        }
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "hangup",
          "fullscreen",
          "settings"
        ],
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        TOOLBAR_ALWAYS_VISIBLE: false,
        VERTICAL_FILMSTRIP: true
      },
      userInfo: {
        displayName: selectedUser?.fullName || "StudyBuddy User",
        email: selectedUser?.email,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    api.addEventListener("readyToClose", () => {
      socket.emit("videoCallEnded", {
        recipientId: selectedUser._id,
        roomId
      });
      navigate(`/post-call-review/${selectedUser._id}`);
    });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [navigate, selectedUser, roomId]);

  const toggleMic = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleAudio");
      setIsMicMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleVideo");
      setIsVideoOff((prev) => !prev);
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleShareScreen");
      setIsScreenSharing((prev) => !prev);
    }
  };

  const endCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("hangup");
    }
    navigate(`/post-call-review/${selectedUser._id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      {/* Call Info Banner */}
      <div className="bg-base-100 shadow-md p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img 
                src={selectedUser?.profilePic || "/avatar.png"} 
                alt={selectedUser?.fullName}
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base-content">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">Study Session</p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div 
        ref={jitsiContainerRef} 
        className="flex-1 w-full"
      />

      {/* Control Panel */}
      <div className="bg-base-100 shadow-lg border-t border-base-300">
        <div className="container mx-auto py-4 px-6 flex items-center justify-center gap-6">
          <button 
            onClick={toggleMic}
            className={`btn btn-circle btn-lg ${isMicMuted ? 'btn-error' : 'btn-primary'}`}
          >
            {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button 
            onClick={toggleVideo}
            className={`btn btn-circle btn-lg ${isVideoOff ? 'btn-error' : 'btn-primary'}`}
          >
            {isVideoOff ? <CameraOff size={24} /> : <Camera size={24} />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`btn btn-circle btn-lg ${isScreenSharing ? 'btn-secondary' : 'btn-primary'}`}
          >
            <Monitor size={24} />
          </button>

          <button 
            onClick={endCall}
            className="btn btn-circle btn-lg btn-error"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
