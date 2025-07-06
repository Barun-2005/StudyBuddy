import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import StudySession from "../models/studySession.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const router = express.Router();

// Create a study session
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, participants, dateTime, duration, agenda } = req.body;
    
    // Calculate endTime based on duration
    const endTime = new Date(new Date(dateTime).getTime() + duration * 60000);
    
    const session = await StudySession.create({
      title,
      organizer: req.user._id,
      participants,
      dateTime,
      endTime,
      duration,
      agenda
    });

    // Notify participants
    participants.forEach(participantId => {
      const socketId = getReceiverSocketId(participantId);
      if (socketId) {
        io.to(socketId).emit("studySessionInvite", {
          session,
          organizer: req.user.fullName
        });
      }
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's study sessions
router.get("/", protectRoute, async (req, res) => {
  try {
    const sessions = await StudySession.find({
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate("organizer participants", "fullName email")
    .sort({ dateTime: 1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update session status (including cancellation)
router.put("/:sessionId/status", protectRoute, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.sessionId,
      organizer: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.status = req.body.status;
    await session.save();

    // Notify participants about cancellation
    if (req.body.status === "cancelled") {
      session.participants.forEach(participantId => {
        const socketId = getReceiverSocketId(participantId);
        if (socketId) {
          io.to(socketId).emit("sessionCancelled", {
            sessionId: session._id,
            title: session.title,
            organizer: req.user.fullName
          });
        }
      });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete("/:sessionId", protectRoute, async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.sessionId,
      organizer: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    await session.deleteOne();
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// Update notification status
router.put("/:sessionId/notification", protectRoute, async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Update notification flags
    if (req.body.notificationSent !== undefined) {
      session.notificationSent = req.body.notificationSent;
    }
    if (req.body.startedNotificationSent !== undefined) {
      session.startedNotificationSent = req.body.startedNotificationSent;
    }

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;






