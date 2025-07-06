import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { format } from "date-fns";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const { socket } = useAuthStore();

  useEffect(() => {
    // Request notification permission when component mounts
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    if (socket) {
      // Listen for new session invites
      socket.on("studySessionInvite", (data) => {
        setSessions(prev => [data.session, ...prev]);
        
        // Show notification for new session invite
        showNotification(
          "New Study Session Invitation",
          `You've been invited to "${data.session.title}" by ${data.organizer}`
        );
      });

      // Listen for session reminders
      socket.on("sessionReminder", (data) => {
        showNotification(
          "Study Session Starting Soon!",
          `Your session "${data.title}" starts in 15 minutes!`,
          {
            icon: "/path-to-your-icon.png", // Add an icon for your notifications
            tag: `session-${data.sessionId}`, // Prevent duplicate notifications
            actions: [
              {
                action: 'join',
                title: 'Join Now'
              }
            ]
          }
        );
      });

      // Listen for session cancellations
      socket.on("sessionCancelled", (data) => {
        showNotification(
          "Session Cancelled",
          `The session "${data.title}" has been cancelled by ${data.organizer}`
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("studySessionInvite");
        socket.off("sessionReminder");
        socket.off("sessionCancelled");
      }
    };
  }, [socket]);

  const showNotification = (title, body, options = {}) => {
    if ("Notification" in window && Notification.permission === "granted") {
      // Play notification sound
      const audio = new Audio('/path-to-notification-sound.mp3'); // Add a notification sound
      audio.play().catch(err => console.log('Audio play failed:', err));

      // Show notification
      const notification = new Notification(title, {
        body,
        badge: '/path-to-badge.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Handle notification click
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        // You can add navigation to the session page here
        // history.push(`/sessions/${data.sessionId}`);
      };
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get("/study-sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-base-content/70">No upcoming sessions</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className="border border-base-300 rounded-lg p-4"
              >
                <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(session.dateTime), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      Organized by: {session.organizer.fullName}
                    </span>
                  </div>
                  {session.agenda && (
                    <div className="mt-2">
                      <p className="text-base-content/70">{session.agenda}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingSessions;
