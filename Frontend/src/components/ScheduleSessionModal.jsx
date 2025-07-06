import React, { useState } from "react";
import { X, Users, Clock, Calendar } from "lucide-react";
import { createPortal } from "react-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from "../store/useAuthStore";

const CustomOption = ({ friend, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 p-2 cursor-pointer hover:bg-base-200 transition-all
      ${isSelected ? 'bg-primary/10' : ''}
    `}
  >
    <div className="relative">
      <img
        src={friend.profilePic || "/avatar.png"}
        alt={friend.fullName}
        className="w-10 h-10 rounded-full object-cover"
      />
      {isSelected && (
        <div className="absolute -right-1 -bottom-1 bg-primary rounded-full p-0.5">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
    <div className="flex-1">
      <p className="font-medium text-sm">{friend.fullName}</p>
      <p className="text-xs text-base-content/70">{friend.email}</p>
    </div>
  </div>
);

const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
  <div 
    className="input input-bordered focus:input-primary transition-all cursor-pointer flex items-center gap-2 w-full" 
    onClick={onClick} 
    ref={ref}
  >
    <Calendar className="w-4 h-4 text-base-content/70" />
    {value || "Select date and time"}
  </div>
));

const ScheduleSessionModal = ({ isOpen, onClose, friends }) => {
  const { socket } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    participants: [],
    dateTime: new Date(),
    duration: 60,
    agenda: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/study-sessions", formData);
      if (socket) {
        socket.emit("studySessionCreated", response.data);
      }
      toast.success("Study session scheduled successfully!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-base-100 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Schedule Study Session
              </h2>
              <p className="text-base-content/70 mt-1">
                Plan your next collaborative study session
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="btn btn-ghost btn-sm btn-circle hover:bg-error/20 hover:text-error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Session Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered focus:input-primary transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter session title..."
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Select Participants</span>
                <span className="label-text-alt text-base-content/70">
                  {formData.participants.length} selected
                </span>
              </label>
              <div className="dropdown dropdown-bottom w-full">
                <div 
                  tabIndex={0} 
                  role="button" 
                  className="input input-bordered focus:input-primary transition-all w-full flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-base-content/70" />
                  <span className="flex-1 text-left">
                    {formData.participants.length 
                      ? `${formData.participants.length} participant${formData.participants.length !== 1 ? 's' : ''} selected`
                      : "Select participants..."
                    }
                  </span>
                </div>
                <div 
                  tabIndex={0} 
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-[240px] overflow-y-auto border border-base-300"
                >
                  {friends.map(friend => (
                    <CustomOption
                      key={friend._id}
                      friend={friend}
                      isSelected={formData.participants.includes(friend._id)}
                      onClick={() => {
                        const newParticipants = formData.participants.includes(friend._id)
                          ? formData.participants.filter(id => id !== friend._id)
                          : [...formData.participants, friend._id];
                        setFormData({ ...formData, participants: newParticipants });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-control relative">
                <label className="label">
                  <span className="label-text font-medium">Date & Time</span>
                </label>
                <DatePicker
                  selected={formData.dateTime}
                  onChange={(date) => {
                    setFormData({ ...formData, dateTime: date });
                    // Auto close after selection
                    document.body.click();
                  }}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  customInput={<CustomInput />}
                  calendarClassName="bg-base-100 shadow-xl border-0"
                  popperClassName="datepicker-popper"
                  popperPlacement="bottom-start"
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  timeCaption="Time"
                  showTimeInput={false}
                  inline={false}
                  shouldCloseOnSelect={true}
                  showTimeSelectOnly={false}
                  timeClassName={() => "text-center"}
                  popperModifiers={[
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8]
                      }
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'viewport',
                        padding: 16
                      }
                    }
                  ]}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Duration</span>
                  <span className="label-text-alt text-base-content/70">minutes</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered focus:input-primary transition-colors"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min="15"
                  max="180"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Agenda/Notes</span>
                <span className="label-text-alt text-base-content/70">optional</span>
              </label>
              <textarea
                className="textarea textarea-bordered focus:textarea-primary transition-colors min-h-[100px]"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="Add session agenda or notes..."
                rows="3"
              />
            </div>

            <div className="pt-4 border-t border-base-300">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Schedule Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ScheduleSessionModal;















