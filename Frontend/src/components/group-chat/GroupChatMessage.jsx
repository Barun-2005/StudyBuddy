const GroupChatMessage = ({ message, isOwn }) => {
  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-sm bg-base-200 text-base-content/70 px-4 py-2 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`chat ${isOwn ? 'chat-end' : 'chat-start'} mb-4`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img 
            src={message.senderId.profilePic || "/avatar.png"} 
            alt={message.senderId.fullName} 
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        {message.senderId.fullName}
        <time className="text-xs opacity-50 ml-2">
          {new Date(message.createdAt).toLocaleTimeString()}
        </time>
      </div>
      <div className={`chat-bubble ${isOwn ? 'chat-bubble-primary' : ''}`}>
        {message.text}
      </div>
      {message.image && (
        <div className="mt-2">
          <img 
            src={message.image} 
            alt="Message attachment" 
            className="rounded-lg max-w-sm"
          />
        </div>
      )}
    </div>
  );
};

export default GroupChatMessage;
