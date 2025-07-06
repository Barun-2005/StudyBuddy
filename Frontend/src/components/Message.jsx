import { formatMessageTime } from "../lib/utils";

const Message = ({ message, isOwnMessage }) => {
  return (
    <div className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img 
            src={message.sender?.profilePic || "/avatar.png"} 
            alt="avatar" 
          />
        </div>
      </div>
      <div className="chat-bubble">
        {message.text}
        {message.image && (
          <img 
            src={message.image} 
            alt="message" 
            className="mt-2 max-w-[200px] rounded-lg"
          />
        )}
      </div>
      <div className="chat-footer opacity-50 text-xs">
        {formatMessageTime(message.createdAt)}
      </div>
    </div>
  );
};

export default Message;
