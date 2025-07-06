import React, { useState, useEffect } from 'react';
import SessionsList from '../components/SessionsList';
import ScheduleSessionModal from '../components/ScheduleSessionModal';
import { axiosInstance } from "../lib/axios";
import { Calendar } from 'lucide-react';

const SessionsPage = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        // Using the same endpoint as Dashboard
        const response = await axiosInstance.get("/friendRequests/friendsList");
        setFriends(response.data);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Study Sessions
          </h1>
          <p className="text-base-content/70 mt-1">
            Manage and join your scheduled study sessions
          </p>
        </div>
        <button 
          onClick={() => setIsScheduleModalOpen(true)} 
          className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-primary/50 transition-all"
          disabled={loading || friends.length === 0}
        >
          <Calendar className="w-5 h-5" />
          Schedule New Session
        </button>
      </div>
      
      <div className="bg-base-200 rounded-xl p-6 shadow-lg">
        <SessionsList />
      </div>

      {/* Schedule Session Modal */}
      {isScheduleModalOpen && (
        <ScheduleSessionModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          friends={friends}
        />
      )}
    </div>
  );
};

export default SessionsPage;




