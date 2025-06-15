import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import StudyGroup from "../models/studyGroup.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js"; // Add getReceiverSocketId to imports
import GroupMessage from "../models/groupMessage.model.js";

const router = express.Router();

// Create a study group
router.post("/", protectRoute, async (req, res) => {
  try {
    const { name, exam, subjects, description, maxMembers, isOpen } = req.body;
    const group = await StudyGroup.create({
      name,
      admin: req.user._id,
      members: [req.user._id],
      exam,
      subjects,
      description,
      maxMembers,
      isOpen
    });
    
    const populatedGroup = await group.populate("admin members", "fullName email");
    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active study groups
router.get("/", protectRoute, async (req, res) => {
  try {
    const groups = await StudyGroup.find({ isActive: true })
      .populate("admin members", "fullName email")
      .populate("pendingRequests.userId", "fullName email");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join or request to join a group
router.post("/:groupId/join", protectRoute, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const userIdStr = req.user._id.toString();
    
    if (group.members.some(memberId => memberId.toString() === userIdStr)) {
      return res.status(400).json({ error: "Already a member" });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ error: "Group is full" });
    }

    if (group.isOpen) {
      group.members.push(req.user._id);
      await group.save();
      
      const populatedGroup = await group.populate("admin members", "fullName email");
      
      // Create a room name for the group
      const roomName = `group:${group._id}`;
      
      // Notify group members using room broadcast instead of individual messages
      io.to(roomName).emit("groupMemberJoined", {
        groupId: group._id,
        user: {
          _id: req.user._id,
          fullName: req.user.fullName
        }
      });

      return res.json(populatedGroup);
    } else {
      const existingRequest = group.pendingRequests.find(
        request => request.userId.toString() === userIdStr
      );

      if (!existingRequest) {
        group.pendingRequests.push({ userId: req.user._id });
        await group.save();
      }

      return res.json({ message: "Join request sent successfully" });
    }
  } catch (error) {
    console.error("Join group error:", error);
    return res.status(500).json({ 
      error: "Failed to join group", 
      details: error.message 
    });
  }
});

// Handle join request (admin only)
router.put("/:groupId/requests/:userId", protectRoute, async (req, res) => {
  try {
    const { status } = req.body;
    const group = await StudyGroup.findOne({
      _id: req.params.groupId,
      admin: req.user._id
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found or unauthorized" });
    }

    const request = group.pendingRequests.find(
      req => req.userId.toString() === req.params.userId
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (status === "accepted") {
      group.members.push(request.userId);
      group.pendingRequests = group.pendingRequests.filter(
        req => req.userId.toString() !== req.params.userId
      );
    } else if (status === "rejected") {
      request.status = "rejected";
    }

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group route
router.post("/:groupId/leave", protectRoute, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await StudyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Admin cannot leave the group" });
    }

    // Remove user from members array
    group.members = group.members.filter(
      memberId => memberId.toString() !== req.user._id.toString()
    );
    await group.save();

    // Create system message about user leaving
    const systemMessage = await GroupMessage.create({
      groupId,
      senderId: req.user._id,
      text: `${req.user.fullName} left the group`,
      isSystemMessage: true
    });

    const populatedMessage = await systemMessage.populate("senderId", "fullName profilePic");

    // Notify remaining members through socket
    io.to(`group:${groupId}`).emit("groupMessage", {
      ...populatedMessage.toJSON(),
      groupId
    });

    io.to(`group:${groupId}`).emit("memberLeft", {
      groupId,
      userId: req.user._id,
      userName: req.user.fullName
    });

    res.json({ message: "Successfully left the group" });
  } catch (error) {
    res.status(500).json({ error: "Failed to leave group" });
  }
});

export default router;






