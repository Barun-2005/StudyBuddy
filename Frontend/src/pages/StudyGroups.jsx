import { useState } from "react";
import { Users, Plus, Search, Book, School } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import CreateGroupModal from "../components/CreateGroupModal";
import StudyGroupList from "../components/StudyGroupList";

const StudyGroups = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    exam: "",
    subject: ""
  });

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-base-100 p-4 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-square">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={filter.exam}
                onChange={(e) => setFilter(prev => ({ ...prev, exam: e.target.value }))}
              >
                <option value="">All Exams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="UPSC">UPSC</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-control">
              <select
                className="select select-bordered w-full"
                value={filter.subject}
                onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
              >
                <option value="">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Study Group List Component */}
        <StudyGroupList filter={filter} searchTerm={searchTerm} />
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={() => {
            // Refresh the groups list
            // Add your refresh logic here
          }}
        />
      )}
    </div>
  );
};

export default StudyGroups;



