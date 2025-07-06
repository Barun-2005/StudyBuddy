import express from "express";
import mongoose from "mongoose";
import passport from 'passport';
import { generateToken } from "../lib/utils.js";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/updateProfile", protectRoute, updateProfile);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

// Get user by ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId)
      .select("-password -refreshToken")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in GET /user/:userId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Google Auth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id, res);
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=true`);
    }
  }
);

export default router;



