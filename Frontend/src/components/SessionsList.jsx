import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { format } from "date-fns";
import { Calendar, Clock, Users, Trash2, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

const SessionsList = () => {
  const { authUser, socket } = useAuthStore();
  const [sessions, setSessions] = useState({
    upcoming: [],
    ongoing: [],
    past: []
  });
  const navigate = useNavigate();

  // Request notification permissions on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchSessions();
    // Refresh sessions every minute to update ongoing status
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for session reminders (upcoming - 15 min before)
    socket.on("sessionReminder", (data) => {
      console.log("Session reminder received:", data);
      fetchSessions(); // Refresh sessions when receiving updates
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(
          data.type === "upcoming" ? "Session Starting Soon!" : "Session Started!", 
          {
            body: data.type === "upcoming" 
              ? `Your session "${data.title}" starts in 15 minutes!`
              : `Your session "${data.title}" has started!`,
            icon: "/favicon.ico",
            tag: `session-${data.sessionId}-${data.type}`,
            requireInteraction: true
          }
        );

        // Handle notification click
        notification.onclick = function() {
          window.focus();
          window.location.href = `/sessions/${data.sessionId}`;
        };
      }

      // Show toast
      toast((t) => (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium">
              {data.type === "upcoming" ? "Session Starting Soon!" : "Session Started!"}
            </p>
            <p className="text-sm text-base-content/70">
              {data.type === "upcoming" 
                ? `${data.title} starts in 15 minutes` 
                : data.title}
            </p>
          </div>
          <button 
            onClick={() => {
              window.location.href = `/sessions/${data.sessionId}`;
              toast.dismiss(t.id);
            }} 
            className="btn btn-sm btn-primary"
          >
            {data.type === "upcoming" ? "View" : "Join Now"}
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      });
    });

    // Listen for session cancellations
    socket.on("sessionCancelled", (data) => {
      console.log("Session cancelled notification received:", data);
      fetchSessions();
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));

      // Show toast for cancellation
      toast((t) => (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium">Session Cancelled</p>
            <p className="text-sm text-base-content/70">
              {`"${data.title}" has been cancelled by ${data.organizer}`}
            </p>
          </div>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="btn btn-sm btn-error"
          >
            Dismiss
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      });
    });

    // Listen for new study session invites
    socket.on("studySessionInvite", (data) => {
      console.log("Study session invite received:", data);
      fetchSessions();
      
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));

      // Show toast for new invitation
      toast((t) => (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium">New Study Session Invitation</p>
            <p className="text-sm text-base-content/70">
              {`You've been invited to "${data.session.title}" by ${data.organizer}`}
            </p>
          </div>
          <button 
            onClick={() => {
              window.location.href = `/sessions/${data.session._id}`;
              toast.dismiss(t.id);
            }} 
            className="btn btn-sm btn-primary"
          >
            View
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
      });
    });

    return () => {
      socket.off("sessionReminder");
      socket.off("sessionCancelled");
      socket.off("studySessionInvite");
    };
  }, [socket]);

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get("/study-sessions");
      const now = new Date();
      
      if (!Array.isArray(response.data)) {
        console.error("Invalid response data format");
        return;
      }

      const categorizedSessions = response.data.reduce((acc, session) => {
        if (!session || !session.dateTime || !session.duration) {
          return acc;
        }

        const startTime = new Date(session.dateTime);
        const endTime = new Date(startTime.getTime() + session.duration * 60000);
        
        // Move cancelled sessions to past
        if (session.status === "cancelled") {
          acc.past.push(session);
        } else if (now < startTime) {
          acc.upcoming.push(session);
        } else if (now >= startTime && now <= endTime) {
          acc.ongoing.push(session);
        } else {
          acc.past.push(session);
        }
        return acc;
      }, { upcoming: [], ongoing: [], past: [] });

      // Sort sessions by date
      categorizedSessions.upcoming.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      categorizedSessions.ongoing.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      categorizedSessions.past.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

      setSessions(categorizedSessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  const handleCancelSession = async (sessionId) => {
    // Show a styled confirmation toast instead of browser alert
    toast((t) => (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="font-medium">Cancel Session?</p>
          <p className="text-sm text-base-content/70">
            This action cannot be undone
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.put(`/api/study-sessions/${sessionId}/status`, {
                  status: "cancelled"
                });
                
                // Update local state
                setSessions(prev => {
                  const upcomingSession = prev.upcoming.find(s => s._id === sessionId);
                  const ongoingSession = prev.ongoing.find(s => s._id === sessionId);
                  const updatedSession = upcomingSession || ongoingSession;
                  
                  if (updatedSession) {
                    updatedSession.status = "cancelled";
                    return {
                      upcoming: prev.upcoming.filter(s => s._id !== sessionId),
                      ongoing: prev.ongoing.filter(s => s._id !== sessionId),
                      past: [...prev.past, updatedSession]
                    };
                  }
                  return prev;
                });

                toast.success("Session cancelled successfully");
              } catch (error) {
                toast.error("Failed to cancel session");
                console.error("Failed to cancel session:", error);
              }
            }}
            className="btn btn-sm btn-error"
          >
            Cancel Session
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn btn-sm btn-ghost"
          >
            Keep
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: "top-center",
    });
  };

  const handleDeleteSession = async (sessionId) => {
    // Show a styled confirmation toast instead of browser alert
    toast((t) => (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="font-medium">Delete Session?</p>
          <p className="text-sm text-base-content/70">
            This action cannot be undone
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/api/study-sessions/${sessionId}`);
                
                // Update local state
                setSessions(prev => ({
                  upcoming: prev.upcoming.filter(s => s._id !== sessionId),
                  ongoing: prev.ongoing.filter(s => s._id !== sessionId),
                  past: prev.past.filter(s => s._id !== sessionId)
                }));

                toast.success("Session deleted successfully");
              } catch (error) {
                toast.error("Failed to delete session");
                console.error("Failed to delete session:", error);
              }
            }}
            className="btn btn-sm btn-error"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="btn btn-sm btn-ghost"
          >
            Keep
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: "top-center",
    });
  };

  const SessionCard = ({ session }) => {
    const navigate = useNavigate();
    const { setSelectedUser } = useChatStore();
    
    // Find the first participant that isn't the current user
    const getSessionPartner = () => {
      if (!session.participants || session.participants.length === 0) return null;
      return session.participants.find(p => p._id !== authUser._id) || session.participants[0];
    };

    const handleJoinSession = () => {
      const partner = getSessionPartner();
      if (partner) {
        setSelectedUser(partner);
        navigate('/chat');
      } else {
        toast.error("No participant found for this session");
      }
    };

    if (!session || !session.organizer) {
      return null;
    }

    const isOrganizer = authUser && String(session.organizer._id) === String(authUser._id);
    const isPast = new Date(session.dateTime) < new Date();
    const isCancelled = session.status === "cancelled";
    const isOngoing = !isPast && !isCancelled;
    const sessionStartTime = new Date(session.dateTime);
    const sessionEndTime = new Date(sessionStartTime.getTime() + session.duration * 60000);
    const now = new Date();
    const isActiveNow = now >= sessionStartTime && now <= sessionEndTime && !isCancelled;

    return (
      <div className={`border border-base-300 rounded-lg p-4 ${
        isCancelled ? 'opacity-75 bg-base-200' : 
        isActiveNow ? 'border-success/50 bg-success/5' : ''
      }`}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {session.title}
              {isCancelled && (
                <span className="ml-2 text-sm text-error">(Cancelled)</span>
              )}
              {isActiveNow && (
                <span className="ml-2 text-sm text-success flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  Active Now
                </span>
              )}
            </h3>
          </div>
          
          {authUser && (
            <div className="flex items-center gap-2">
              {/* Join button for active sessions */}
              {isActiveNow && (
                <button
                  onClick={handleJoinSession}
                  className="btn btn-success btn-sm gap-2 normal-case"
                  title="Join active session"
                >
                  <Video className="w-4 h-4" />
                  Join
                </button>
              )}
              {/* Cancel button for organizer */}
              {isOrganizer && !isPast && !isCancelled && (
                <button
                  onClick={() => handleCancelSession(session._id)}
                  className="btn btn-sm btn-warning gap-1"
                  title="Cancel session"
                >
                  Cancel
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {/* Delete button for past/cancelled sessions */}
              {isOrganizer && (isPast || isCancelled) && (
                <button
                  onClick={() => handleDeleteSession(session._id)}
                  className="btn btn-sm btn-error gap-1"
                  title="Delete session"
                >
                  Delete
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(session.dateTime), "MMM d, yyyy h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{session.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Organized by: {session.organizer?.fullName || 'Unknown'}</span>
          </div>
          {session.agenda && (
            <div className="mt-2">
              <p className="text-base-content/70">{session.agenda}</p>
            </div>
          )}
          <div className="mt-2">
            <p className="text-sm text-base-content/70">
              Participants: {session.participants?.map(p => p.fullName).join(", ") || 'No participants'}
            </p>
          </div>
          {isCancelled && (
            <div className="mt-2">
              <p className="text-sm text-error">
                This session has been cancelled by the organizer
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SessionSection = ({ title, sessions, emptyMessage, className }) => (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {sessions.length === 0 ? (
        <p className="text-base-content/70">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <SessionSection
        title="Ongoing Sessions"
        sessions={sessions.ongoing}
        emptyMessage="No ongoing sessions"
        className="bg-success/5 p-4 rounded-lg"
      />
      
      <SessionSection
        title="Upcoming Sessions"
        sessions={sessions.upcoming}
        emptyMessage="No upcoming sessions"
        className="bg-info/5 p-4 rounded-lg"
      />
      
      <SessionSection
        title="Past Sessions"
        sessions={sessions.past}
        emptyMessage="No past sessions"
        className="bg-base-200 p-4 rounded-lg"
      />
    </div>
  );
};

export default SessionsList;



