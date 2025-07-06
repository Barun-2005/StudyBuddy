import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import GroupChat from './GroupChat';
import GroupChatHeader from './GroupChatHeader';
import GroupList from './GroupList';

const GroupChatSection = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const { socket, authUser } = useAuthStore();

  useEffect(() => {
    fetchGroups();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axiosInstance.get('/api/study-groups');
      setGroups(response.data.filter(group => 
        group.members.some(member => member._id === authUser._id)
      ));
    } catch (error) {
      toast.error('Failed to fetch groups');
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('newGroupMessage', handleNewMessage);
    socket.on('groupMemberUpdate', handleMemberUpdate);
    socket.on('groupUpdate', handleGroupUpdate);
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    socket.off('newGroupMessage');
    socket.off('groupMemberUpdate');
    socket.off('groupUpdate');
  };

  const handleNewMessage = (message) => {
    if (message.groupId === selectedGroup?._id) {
      // Update messages in GroupChat component
      return;
    }
    // Show notification for unselected group
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

  const handleGroupUpdate = (updatedGroup) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r">
        <GroupList 
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <GroupChatHeader 
              group={selectedGroup}
              onGroupUpdate={handleGroupUpdate}
            />
            <GroupChat groupId={selectedGroup._id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-base-content/70">
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatSection;