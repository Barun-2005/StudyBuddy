import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import SearchBuddy from "./pages/SearchBuddy";
import VideoCall from "./pages/VideoCall";
import PostCallReview from "./pages/PostCallReview";
import VideoCallModal from './components/VideoCallModal';
import { axiosInstance } from './lib/axios';
import UserReviews from "./pages/UserReviews";
import AuthSuccess from './pages/AuthSuccess';
import SessionsPage from "./pages/SessionsPage";
import StudyGroups from "./pages/StudyGroups";
import GroupChatPage from "./pages/GroupChatPage";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect, useState } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const App = () => {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { theme } = useThemeStore();

  // Apply theme on mount and theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // First useEffect - check auth
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Second useEffect - socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("videoCallRequest", (data) => {
      setIncomingCall(data);
      toast('Incoming video call...', {
        icon: '📞',
        duration: 6000
      });
    });

    socket.on("callEnded", () => {
      toast('Call ended by other user', {
        icon: '📞',
      });
      navigate("/chat");
    });

    return () => {
      socket.off("videoCallRequest");
      socket.off("callEnded");
    };
  }, [socket, navigate]);

  const handleCallResponse = async (response) => {
    try {
      await axiosInstance.post("/calls/respond", {
        callId: incomingCall.callSession._id,
        response
      });
      setIncomingCall(null);
    } catch (error) {
      toast.error("Failed to respond to call");
    }
  };

  useEffect(() => {
    // Request notification permissions
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-base-100">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        <div className="h-full custom-scrollbar">
          <Routes>
            <Route
              path="/"
              element={authUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
            <Route path="/dashboard" element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/chat" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/searchBuddy" element={authUser ? <SearchBuddy /> : <Navigate to="/login" />} />
            <Route path="/sessions" element={authUser ? <SessionsPage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/videoCall" element={authUser ? <VideoCall /> : <Navigate to="/login" />} />
            <Route path="/post-call-review/:partnerId" element={<PostCallReview />} />
            <Route 
              path="/reviews/:userId" 
              element={<UserReviews />} 
            />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route 
              path="/study-groups" 
              element={authUser ? <StudyGroups /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/group-chats" 
              element={authUser ? <GroupChatPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </main>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: 'bg-base-100 text-base-content shadow-lg border border-base-200 rounded-xl',
          style: {
            padding: '12px',
            borderRadius: '12px',
          }
        }}
      />
      {incomingCall && (
        <VideoCallModal
          call={incomingCall}
          onRespond={handleCallResponse}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
};

export default App;

















