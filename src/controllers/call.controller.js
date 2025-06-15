import CallSession from "../models/callSession.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { v4 as uuidv4 } from "uuid";

export const initiateCall = async (req, res) => {
  try {
    const initiatorId = req.user._id;
    const { recipientId } = req.body;

    // Generate unique room ID
    const roomId = uuidv4();

    const callSession = await CallSession.create({
      roomId,
      initiatorId,
      recipientId,
      status: "pending"
    });

    // Get recipient's socket ID
    const recipientSocketId = getReceiverSocketId(recipientId);
    
    if (recipientSocketId) {
      // Emit call request to recipient
      io.to(recipientSocketId).emit("videoCallRequest", {
        callSession,
        caller: req.user
      });
    }

    res.status(201).json(callSession);
  } catch (error) {
    console.error("Error in initiateCall:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const respondToCall = async (req, res) => {
  try {
    const { callId, response } = req.body;
    
    const callSession = await CallSession.findById(callId);
    if (!callSession) {
      return res.status(404).json({ error: "Call session not found" });
    }

    callSession.status = response;
    await callSession.save();

    // Get initiator's socket ID
    const initiatorSocketId = getReceiverSocketId(callSession.initiatorId);
    
    if (initiatorSocketId) {
      io.to(initiatorSocketId).emit("videoCallResponse", {
        callSession,
        response
      });
    }

    res.json(callSession);
  } catch (error) {
    console.error("Error in respondToCall:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};