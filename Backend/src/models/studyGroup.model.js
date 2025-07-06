import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  pendingRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  exam: {
    type: String,
    enum: ["JEE", "NEET", "UPSC", "Other"],
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  description: String,
  maxMembers: {
    type: Number,
    default: 10
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
export default StudyGroup;
