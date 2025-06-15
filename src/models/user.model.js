import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      default: "",
    },
    exam: {
      type: String,
      enum: ["JEE", "NEET", "UPSC", "Other"],
      default: "Other",
    },
    subjects: {
      type: [String],
      default: [],
    },
    studyPreferences: {
      type: String,
      enum: ["Group", "One-on-One", "Either"],
      default: "Either",
    },
    availability: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [String],
      default: [],
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    friendRequests: [
      {
        fromUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;


