import { X, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { studyGroupService } from '../../services/studyGroupService';
import toast from 'react-hot-toast';

const GroupMembersModal = ({ isOpen, onClose, group }) => {
  const { authUser } = useAuthStore();
  const isAdmin = group.admin === authUser._id;

  const handleRemoveMember = async (memberId) => {
    try {
      await studyGroupService.removeMember(group._id, memberId);
      toast.success('Member removed successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await studyGroupService.leaveGroup(group._id);
      toast.success('Left group successfully');
      onClose();
      // Redirect to groups list or handle navigation
      window.location.href = '/groups';
    } catch (error) {
      toast.error('Failed to leave group');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Group Members</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            ✕
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {group.members.map((member) => (
            <div 
              key={member._id} 
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.profilePic || "/avatar.png"}
                  alt={member.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-sm text-base-content/70">{member.email}</p>
                </div>
                {member._id === group.admin && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2">
                    Admin
                  </span>
                )}
              </div>
              
              {isAdmin && member._id !== authUser._id && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="btn btn-ghost btn-sm text-error"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Leave Group button at the bottom */}
        {!isAdmin && (
          <div className="border-t pt-4 mt-4">
            <button
              onClick={handleLeaveGroup}
              className="btn btn-error btn-outline w-full"
            >
              Leave Group
            </button>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default GroupMembersModal;

