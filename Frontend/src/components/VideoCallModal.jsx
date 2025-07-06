import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VideoCallModal = ({ call, onRespond, onClose }) => {
  const navigate = useNavigate();
  const ringingSound = new Audio('/call-ring.mp3');

  useEffect(() => {
    ringingSound.loop = true;
    ringingSound.play();
    
    const timeout = setTimeout(() => {
      onRespond('declined');
      toast.error('Call timed out');
    }, 30000);

    return () => {
      ringingSound.pause();
      clearTimeout(timeout);
    };
  }, []);

  const handleAccept = () => {
    onRespond('accepted');
    navigate('/videoCall', { 
      state: { 
        selectedUser: call.caller,
        roomId: call.callSession.roomId 
      } 
    });
  };

  return (
    <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-base-100 border border-base-300 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-fadeIn">
        <h3 className="text-xl font-bold mb-6 text-base-content">Incoming Video Call</h3>
        <div className="flex items-center gap-5 mb-8">
          <div className="avatar">
            <div className="w-20 h-20 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
              <img 
                src={call.caller.profilePic || "/avatar.png"} 
                alt="Caller"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="font-semibold text-lg text-base-content">{call.caller.fullName}</p>
            <p className="text-base-content/70">is calling you...</p>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => onRespond('declined')} 
            className="btn btn-outline btn-error hover:btn-error"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept} 
            className="btn btn-primary"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;


