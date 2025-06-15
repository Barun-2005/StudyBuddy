import User from '../models/user.model.js';
import Message from '../models/message.model.js';

export const unfriendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;

    if (!userId || !loggedInUserId) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    // Delete messages between the users
    await Message.deleteMany({
      $or: [
        { senderId: loggedInUserId, receiverId: userId },
        { senderId: userId, receiverId: loggedInUserId }
      ]
    });

    // Complete cleanup of friend relationships and requests
    await Promise.all([
      User.findByIdAndUpdate(loggedInUserId, {
        $pull: { 
          friends: userId,
          'friendRequests': { fromUserId: userId }
        }
      }),
      User.findByIdAndUpdate(userId, {
        $pull: { 
          friends: loggedInUserId,
          'friendRequests': { fromUserId: loggedInUserId }
        }
      })
    ]);

    res.status(200).json({ message: "Successfully unfriended user" });
  } catch (error) {
    console.error("Error in unfriendUser:", error);
    res.status(500).json({ error: "Failed to unfriend user" });
  }
};




