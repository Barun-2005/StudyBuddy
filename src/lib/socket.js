import { Server } from "socket.io";
import http from "http";
import express from "express";
import StudySession from "../models/studySession.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Handle joining group chat rooms
  socket.on("joinGroupChat", (groupId) => {
    console.log(`User ${socket.id} joining group: ${groupId}`);
    socket.join(`group:${groupId}`);
  });

  // Handle leaving group chat rooms
  socket.on("leaveGroupChat", (groupId) => {
    console.log(`User ${socket.id} leaving group: ${groupId}`);
    socket.leave(`group:${groupId}`);
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Add video call events
  socket.on("videoCallEnded", (data) => {
    const recipientSocketId = getReceiverSocketId(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("callEnded", data);
    }
  });

  // Handle study session notifications
  socket.on("studySessionCreated", async (sessionData) => {
    sessionData.participants.forEach(participantId => {
      const recipientSocketId = getReceiverSocketId(participantId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newStudySession", sessionData);
      }
    });
  });

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Function to send session reminders
export async function sendSessionReminders() {
  const upcoming = new Date();
  upcoming.setMinutes(upcoming.getMinutes() + 15);
  const now = new Date();

  try {
    // Find upcoming sessions
    const sessions = await StudySession.find({
      dateTime: { $gte: now, $lte: upcoming },
      notificationSent: false,
      status: "scheduled"
    }).populate("organizer participants", "fullName");

    const ongoingSessions = await StudySession.find({
      dateTime: { $lte: now },
      endTime: { $gte: now },
      status: "scheduled",
      startedNotificationSent: { $ne: true }
    }).populate("organizer participants", "fullName");

    // Send reminders for upcoming sessions
    sessions.forEach(async (session) => {
      const allParticipants = [session.organizer, ...session.participants];
      
      allParticipants.forEach(participant => {
        const socketId = getReceiverSocketId(participant._id);
        if (socketId) {
          io.to(socketId).emit("sessionReminder", {
            sessionId: session._id,
            title: session.title,
            startTime: session.dateTime,
            type: "upcoming"
          });
        }
      });

      session.notificationSent = true;
      await session.save();
    });

    ongoingSessions.forEach(async (session) => {
      const allParticipants = [session.organizer, ...session.participants];
      
      allParticipants.forEach(participant => {
        const socketId = getReceiverSocketId(participant._id);
        if (socketId) {
          io.to(socketId).emit("sessionReminder", {
            sessionId: session._id,
            title: session.title,
            type: "started"
          });
        }
      });

      session.startedNotificationSent = true;
      await session.save();
    });
  } catch (error) {
    console.error("Error sending session reminders:", error);
  }
}

setInterval(sendSessionReminders, 60000);

export { io, app, server };








