import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudyGroup",
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: function() {
      return !this.image;
    }
  },
  image: {
    type: String,
    required: function() {
      return !this.text;
    }
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;



