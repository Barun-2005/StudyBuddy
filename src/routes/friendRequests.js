import express from "express";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Send a Friend Request
router.post("/sendFriendRequest", protectRoute, async (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.id;

  try {
    // Check if users exist
    const [toUser, fromUser] = await Promise.all([
      User.findById(toUserId),
      User.findById(fromUserId)
    ]);

    if (!toUser || !fromUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove any existing friend requests in either direction
    await Promise.all([
      User.findByIdAndUpdate(toUserId, {
        $pull: { friendRequests: { fromUserId: fromUserId } }
      }),
      User.findByIdAndUpdate(fromUserId, {
        $pull: { friendRequests: { fromUserId: toUserId } }
      })
    ]);

    // Add the new friend request
    toUser.friendRequests.push({ fromUserId, status: "pending" });
    await toUser.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Error sending friend request" });
  }
});

// 2. Get Pending Friend Requests
router.get("/pendingRequests", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friendRequests.fromUserId", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pendingRequests = user.friendRequests.filter(
      (request) => request.status === "pending"
    );

    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending requests", error });
  }
});

// 3. Respond to a Friend Request (Accept or Decline)
router.post("/respondToFriendRequest", protectRoute, async (req, res) => {
  try {
    const { fromUserId, response } = req.body;
    const toUserId = req.user._id;

    // Find both users
    const [currentUser, requestingUser] = await Promise.all([
      User.findById(toUserId),
      User.findById(fromUserId)
    ]);

    if (!currentUser || !requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.friends) currentUser.friends = [];
    if (!requestingUser.friends) requestingUser.friends = [];

    // Find and update the friend request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.fromUserId.toString() === fromUserId.toString()
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (response === "accepted") {
      // Update both users' friendRequests arrays
      await Promise.all([
        User.findByIdAndUpdate(toUserId, {
          $push: { friends: fromUserId },
          $set: { [`friendRequests.${requestIndex}.status`]: "accepted" }
        }),
        User.findByIdAndUpdate(fromUserId, {
          $push: { friends: toUserId },
          $push: { friendRequests: { fromUserId: toUserId, status: "accepted" } }
        })
      ]);

      // Get updated user data
      const updatedCurrentUser = await User.findById(toUserId)
        .populate("friends")
        .populate("friendRequests.fromUserId");

      res.status(200).json({ 
        message: "Friend request accepted",
        updatedUser: updatedCurrentUser
      });
    } else {
      // If declined, remove the friend request
      currentUser.friendRequests.splice(requestIndex, 1);
      await currentUser.save();
      
      res.status(200).json({ 
        message: "Friend request declined",
        updatedUser: currentUser
      });
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ 
      message: "Error responding to friend request",
      error: error.message 
    });
  }
});

// 4. Get Friends List
router.get("/friendsList", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friendRequests.fromUserId", "fullName email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter accepted friend requests
    const friends = user.friendRequests.filter(
      (request) => request.status === "accepted"
    );

    res.status(200).json(friends.map((request) => request.fromUserId));
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends list", error });
  }
});

export default router;
