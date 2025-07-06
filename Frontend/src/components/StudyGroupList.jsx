import { useState, useEffect } from "react";
import { Users, Book, School } from "lucide-react";
import { studyGroupService } from "../services/studyGroupService";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import GroupCard from "./GroupCard";

const StudyGroupList = ({ filter, searchTerm }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useAuthStore();

  useEffect(() => {
    fetchGroups();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, [filter]);

  const fetchGroups = async () => {
    try {
      const response = await studyGroupService.getGroups(filter);
      setGroups(response.data);
    } catch (error) {
      toast.error("Failed to fetch study groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId, isOpen) => {
    try {
      const response = await studyGroupService.joinGroup(groupId);
      
      // Update groups list
      await fetchGroups();
      
      toast.success(isOpen 
        ? "Successfully joined the group!"
        : "Join request sent successfully!");
      
    } catch (error) {
      console.error("Join group error:", error);
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          "Failed to join group";
      toast.error(errorMessage);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;
    
    socket.on("groupUpdate", handleGroupUpdate);
    socket.on("groupMemberUpdate", handleMemberUpdate);
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;
    
    socket.off("groupUpdate");
    socket.off("groupMemberUpdate");
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  };

  const handleMemberUpdate = (data) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group._id === data.groupId 
          ? { ...group, members: data.members }
          : group
      )
    );
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = !filter.exam || group.exam === filter.exam;
    const matchesSubject = !filter.subject || group.subjects.includes(filter.subject);
    return matchesSearch && matchesExam && matchesSubject;
  });

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGroups.map(group => (
        <GroupCard 
          key={group._id}
          group={group}
          onJoin={handleJoinGroup}
        />
      ))}
    </div>
  );
};

export default StudyGroupList;



