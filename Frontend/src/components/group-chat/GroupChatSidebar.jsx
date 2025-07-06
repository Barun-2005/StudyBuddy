import { MessageSquare } from 'lucide-react';

const GroupChatSidebar = ({ groups, selectedGroup, onSelectGroup, loading }) => {
  if (loading) {
    return (
      <aside className="w-80 border-r border-base-200 p-4">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-base-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r border-base-200">
      <div className="p-4">
        <h2 className="font-semibold mb-4">Your Study Groups</h2>
        <div className="space-y-2">
          {groups.map(group => (
            <button
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className={`
                w-full p-3 rounded-lg flex items-start gap-3 transition-colors
                ${selectedGroup?._id === group._id 
                  ? 'bg-primary text-primary-content' 
                  : 'hover:bg-base-200'
                }
              `}
            >
              <MessageSquare className="w-5 h-5 mt-1 shrink-0" />
              <div className="text-left">
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm opacity-80">
                  {group.members.length} members • {group.exam}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default GroupChatSidebar;