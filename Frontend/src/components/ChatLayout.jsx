import { useState } from 'react';
import ChatContainer from './ChatContainer';
import GroupChatSection from './GroupChatSection';

const ChatLayout = () => {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-3 font-medium transition-colors
              ${activeTab === 'direct' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-base-content/70'
              }`}
          >
            Direct Messages
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-3 font-medium transition-colors
              ${activeTab === 'groups' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-base-content/70'
              }`}
          >
            Group Chats
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'direct' ? (
          <ChatContainer />
        ) : (
          <GroupChatSection />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;