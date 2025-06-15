import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "ended"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

const CallSession = mongoose.model("CallSession", callSessionSchema);
export default CallSession;