import { useState } from 'react';
import { Users, Settings } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';

const GroupChatHeader = ({ group }) => {
  const { authUser } = useAuthStore();
  const [showMembers, setShowMembers] = useState(false);
  const isAdmin = group.admin === authUser._id;

  const handleRemoveMember = async (memberId) => {
    try {
      await axiosInstance.post(`/api/study-groups/${group._id}/remove-member`, {
        memberId
      });
      // Refresh group data
      useChatStore.getState().getGroups();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-12">
              <span className="text-xl">{group.name[0]}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{group.name}</h3>
            <p className="text-sm text-base-content/70">
              {group.members.length} members
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="btn btn-ghost btn-sm"
        >
          <Users className="size-5" />
        </button>
      </div>

      {showMembers && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Members</h4>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-8 rounded-full"
                  />
                  <span>{member.fullName}</span>
                  {member._id === group.admin && (
                    <span className="text-xs bg-base-300 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
                {isAdmin && member._id !== authUser._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatHeader;

