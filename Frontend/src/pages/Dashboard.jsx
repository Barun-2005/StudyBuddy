import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, Sparkles, Bell, Calendar } from "lucide-react"; // Import icons
import { axiosInstance } from "../lib/axios";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import UpcomingSessions from "../components/UpcomingSessions";

const Dashboard = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const navigate = useNavigate();
  const [friendCount, setFriendCount] = useState(0);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get("/friendRequests/friendsList");
        setFriendCount(response.data.length);
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="h-full custom-scrollbar">
      <div className="pt-16 container mx-auto px-4 max-w-7xl pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl shadow-xl p-12 text-center mb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to StudyBuddy!
            </h1>
            <p className="text-base-content/70 text-xl mb-10">
              Connect with study partners, join groups, and ace your exams together!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => navigate("/chat")}
                className="btn btn-primary btn-lg gap-2 min-w-52 shadow-lg hover:shadow-primary/20"
              >
                <MessageSquare className="w-5 h-5" />
                Chat with Friends
              </button>
              <button
                onClick={() => navigate("/searchBuddy")}
                className="btn btn-secondary btn-lg gap-2 min-w-52 shadow-lg hover:shadow-secondary/20"
              >
                <Users className="w-5 h-5" />
                Find Study Buddies
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats Card */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="card-title">Quick Stats</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-primary">24</p>
                  <p className="text-sm text-base-content/70">Study Hours</p>
                </div>
                <div className="bg-base-200 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-secondary">{friendCount}</p>
                  <p className="text-sm text-base-content/70">
                    {friendCount === 0 && "Start Your Journey!"}
                    {friendCount === 1 && "Study Buddy"}
                    {friendCount > 1 && "Study Buddies"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Bell className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="card-title">Latest Announcements</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <p className="text-base-content/70">New video chat feature available!</p>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <p className="text-base-content/70">Study group formations starting soon</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsScheduleModalOpen(true)} 
                  className="btn btn-outline btn-primary w-full"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Study Session
                </button>
                <button 
                  onClick={() => navigate("/study-groups")} 
                  className="btn btn-outline btn-secondary w-full flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Join Study Group
                </button>
                <button 
                  onClick={() => navigate("/group-chats")} 
                  className="btn btn-outline btn-accent w-full flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Group Chats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      {isScheduleModalOpen && (
        <ScheduleSessionModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          friends={friends}  // Pass the friends array here
        />
      )}
    </div>
  );
};

export default Dashboard;
