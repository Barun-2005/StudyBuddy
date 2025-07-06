import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import GroupChatSidebar from '../components/group-chat/GroupChatSidebar';
import GroupChatMain from '../components/group-chat/GroupChatMain';
import { studyGroupService } from '../services/studyGroupService';
import toast from 'react-hot-toast';

const GroupChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, authUser } = useAuthStore();

  useEffect(() => {
    fetchGroups();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await studyGroupService.getGroups();
      setGroups(response.data.filter(group => 
        group.members.some(member => member._id === authUser._id)
      ));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch groups');
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;
    socket.on('groupUpdate', handleGroupUpdate);
    socket.on('newGroupMessage', handleNewMessage);
    socket.on('groupMemberUpdate', handleMemberUpdate);
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;
    socket.off('groupUpdate');
    socket.off('newGroupMessage');
    socket.off('groupMemberUpdate');
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  };

  const handleNewMessage = (message) => {
    if (message.groupId === selectedGroup?._id) return;
    
    toast.custom((t) => (
      <div className="bg-base-200 p-4 rounded-lg shadow-lg">
        <p className="font-semibold">{message.sender.fullName}</p>
        <p className="text-sm opacity-80">{message.text}</p>
      </div>
    ));
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

  return (
    <div className="h-full bg-base-200">
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-6rem)] mt-16">
          <div className="flex h-full rounded-lg overflow-hidden">
            <GroupChatSidebar
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              loading={loading}
            />
            
            <div className="flex-1 flex flex-col">
              {selectedGroup ? (
                <GroupChatMain group={selectedGroup} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-base-content/70">
                  Select a group to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPage;

