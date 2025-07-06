import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';

const GroupList = ({ groups, selectedGroup, onSelectGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 h-10"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-square"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredGroups.map(group => (
          <button
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className={`w-full p-4 text-left hover:bg-base-200 transition-colors
              ${selectedGroup?._id === group._id ? 'bg-base-200' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <span className="text-xl">{group.groupName[0]}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{group.groupName}</h3>
                <p className="text-sm text-base-content/70">
                  {group.members.length} members
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default GroupList;
