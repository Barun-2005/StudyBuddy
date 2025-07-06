import { useState } from "react";
import { X, Check, Users, BookOpen, Info } from "lucide-react";
import { studyGroupService } from "../services/studyGroupService";
import toast from "react-hot-toast";

const SubjectOption = ({ subject, isSelected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`
      flex items-center gap-2 p-2 cursor-pointer rounded-lg transition-all
      ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-base-200 border-transparent'}
      border
    `}
  >
    <div className={`
      w-4 h-4 rounded flex items-center justify-center
      ${isSelected ? 'bg-primary text-primary-content' : 'border border-base-content/20'}
    `}>
      {isSelected && <Check className="w-3 h-3" />}
    </div>
    <span className={`text-sm ${isSelected ? 'text-primary font-medium' : ''}`}>{subject}</span>
  </div>
);

const AVAILABLE_SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Biology",
  "History", "Geography", "Economics", "Computer Science",
  "English", "Political Science"
];

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    exam: "",
    subjects: [],
    description: "",
    maxMembers: 10,
    isOpen: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    setLoading(true);
    try {
      await studyGroupService.createGroup(formData);
      toast.success("Study group created successfully!");
      onGroupCreated?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-md relative">
        {/* Header */}
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Create Study Group</h3>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control col-span-2">
                <input
                  type="text"
                  placeholder="Group Name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={formData.exam}
                  onChange={(e) => setFormData(prev => ({ ...prev, exam: e.target.value }))}
                  required
                >
                  <option value="">Select Exam</option>
                  <option value="UPSC">UPSC</option>
                  <option value="GATE">GATE</option>
                  <option value="CAT">CAT</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-control">
                <div className="join">
                  <span className="join-item flex items-center px-3 bg-base-200">
                    <Users className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    placeholder="Max Members"
                    className="input input-bordered join-item w-full"
                    min="2"
                    max="50"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Subjects
                </span>
                <span className="label-text-alt">{formData.subjects.length} selected</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto p-1">
                {AVAILABLE_SUBJECTS.map(subject => (
                  <SubjectOption
                    key={subject}
                    subject={subject}
                    isSelected={formData.subjects.includes(subject)}
                    onToggle={() => handleSubjectToggle(subject)}
                  />
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="form-control">
              <label className="label py-0">
                <span className="label-text font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" /> Description
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20 resize-none mt-2"
                placeholder="Describe your study group..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Open for everyone to join</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.checked }))}
                />
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-200">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

