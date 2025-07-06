import { useState, useEffect, useRef } from 'react';
import { Send, Image, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { studyGroupService } from '../../services/studyGroupService';
import GroupChatMessage from './GroupChatMessage';
import GroupMembersModal from './GroupMembersModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GroupChatMain = ({ group }) => {
  const navigate = useNavigate();
  
  const handleLeaveGroup = async () => {
    try {
      await studyGroupService.leaveGroup(group._id);
      navigate('/study-groups'); // Navigate to the correct route
    } catch (error) {
      toast.error('Failed to leave group');
    }
  };

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef(null);
  const { authUser, socket } = useAuthStore();

  useEffect(() => {
    if (!group?._id) return;

    setMessages([]);
    setPage(1); // Reset page when changing groups
    fetchMessages();

    if (socket) {
      socket.emit('leaveGroupChat', group._id);
      socket.emit('joinGroupChat', group._id);
      
      const messageHandler = (message) => {
        setMessages(prev => {
          // More robust duplicate check
          const isDuplicate = prev.some(msg => 
            msg._id === message._id || 
            (msg.text === message.text && 
             msg.senderId._id === message.senderId._id && 
             Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
          );
          
          if (isDuplicate) {
            return prev;
          }
          return [...prev, message];
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      socket.on('groupMessage', messageHandler);

      return () => {
        socket.off('groupMessage', messageHandler);
        socket.emit('leaveGroupChat', group._id);
      };
    }
  }, [group._id, socket]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await studyGroupService.getGroupMessages(group._id, page);
      
      setMessages(prev => {
        const newMessages = [...prev];
        response.data.messages.forEach(newMessage => {
          // More robust duplicate check
          const isDuplicate = newMessages.some(msg => 
            msg._id === newMessage._id || 
            (msg.text === newMessage.text && 
             msg.senderId._id === newMessage.senderId._id && 
             Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 1000)
          );
          
          if (!isDuplicate) {
            newMessages.push(newMessage);
          }
        });
        
        // Sort messages by timestamp
        return newMessages.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await studyGroupService.sendGroupMessage(group._id, {
        text: newMessage
      });

      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-4 border-b border-base-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{group.name}</h2>
            <p className="text-sm text-base-content/70">
              {group.exam} • {group.subjects.join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMembers(true)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <Users className="w-4 h-4" />
              {group.members.length} Members
            </button>
            <button
              onClick={handleLeaveGroup}
              className="btn btn-error btn-sm"
            >
              Leave Group
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex justify-center">
            <span className="loading loading-dots"></span>
          </div>
        )}
        
        {messages.map((message) => (
          <GroupChatMessage
            key={`${message._id}-${message.createdAt}`} // More unique key
            message={message}
            isOwn={message.senderId._id === authUser._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {showMembers && (
        <GroupMembersModal
          isOpen={showMembers}
          group={group}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
};

export default GroupChatMain;






