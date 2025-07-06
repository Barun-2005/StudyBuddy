import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  dateTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, 
    required: true
  },
  agenda: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled"
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  startedNotificationSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;

