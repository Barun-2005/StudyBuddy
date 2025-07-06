import { Users, Book } from "lucide-react";

const GroupCard = ({ group, onJoin }) => {
  const isFull = group.members.length >= group.maxMembers;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{group.name}</h2>
        
        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <Book className="w-4 h-4" />
          <span>{group.exam}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-base-content/70">
          <Users className="w-4 h-4" />
          <span>{group.members.length} / {group.maxMembers} members</span>
        </div>

        <p className="text-sm mt-2">{group.description}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          {group.subjects.map(subject => (
            <span key={subject} className="badge badge-primary">{subject}</span>
          ))}
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onJoin(group._id, group.isOpen)}
            disabled={isFull}
          >
            {isFull ? "Full" : group.isOpen ? "Join" : "Request to Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;