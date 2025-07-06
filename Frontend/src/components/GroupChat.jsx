import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { studyGroupService } from '../services/studyGroupService';
import { Send, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const messageEndRef = useRef(null);
  const { authUser, socket } = useAuthStore();

  useEffect(() => {
    fetchMessages();
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await studyGroupService.getGroupMessages(groupId, page);
      setMessages(prev => [...response.data.messages, ...prev]);
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
      const response = await studyGroupService.sendGroupMessage(groupId, {
        text: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      socket?.emit('newGroupMessage', {
        groupId,
        message: response.data
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const subscribeToGroupMessages = () => {
    if (!socket) return;
    
    socket.emit('joinGroupChat', groupId);
    
    socket.on('groupMessage', (message) => {
      if (message.groupId === groupId) {
        setMessages(prev => [...prev, message]);
      }
    });
  };

  const unsubscribeFromGroupMessages = () => {
    if (!socket) return;
    
    socket.emit('leaveGroupChat', groupId);
    socket.off('groupMessage');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.senderId._id === authUser._id}
          />
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
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
    </div>
  );
};

export default GroupChat;

