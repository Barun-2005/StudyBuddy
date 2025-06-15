import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import GroupMessage from "../models/groupMessage.model.js";
import StudyGroup from "../models/studyGroup.model.js";
import { io } from "../lib/socket.js";

const router = express.Router();

// GET - Retrieve group messages with pagination
router.get("/:groupId", protectRoute, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is group member
    const group = await StudyGroup.findById(groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ error: "Not a group member" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const total = await GroupMessage.countDocuments({ groupId });

    return res.status(200).json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch group messages" });
  }
});

// POST - Send a message to group
router.post("/:groupId", protectRoute, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const group = await StudyGroup.findById(groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ error: "Not a group member" });
    }

    const message = await GroupMessage.create({
      groupId,
      senderId: req.user._id,
      text,
      image
    });

    const populatedMessage = await message.populate("senderId", "fullName profilePic");
    const messageToSend = {
      ...populatedMessage.toJSON(),
      groupId
    };

    // Emit to specific group room with clear group identifier
    const roomName = `group:${groupId}`;
    console.log(`Emitting message to room: ${roomName}`);
    io.to(roomName).emit("groupMessage", messageToSend);

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in group message route:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

// DELETE - Delete a message (sender only)
router.delete("/:groupId/messages/:messageId", protectRoute, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await GroupMessage.findOne({
      _id: messageId,
      senderId: req.user._id
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    await message.deleteOne();
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;