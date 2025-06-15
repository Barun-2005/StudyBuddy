import express from "express";
import mongoose from "mongoose";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch reviews with populated reviewer information
    const reviews = await Review.find({ reviewedUser: userId })
      .populate('reviewer', 'fullName profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error in GET /api/reviews/user/:userId:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
});

router.post("/", protectRoute, async (req, res) => {
  const { partnerId, rating, reviewText } = req.body;
  const reviewerId = req.user._id;

  try {
    // Validate required fields
    if (!partnerId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate partnerId format
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Invalid partnerId format" });
    }

    // Check if partner exists
    const partnerExists = await User.findById(partnerId);
    if (!partnerExists) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Create and save the new review
    const newReview = new Review({
      reviewer: reviewerId,
      reviewedUser: partnerId,
      rating: Number(rating),
      reviewText
    });
    await newReview.save();

    // Recalculate average rating
    const reviews = await Review.find({ reviewedUser: partnerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Update user's rating
    await User.findByIdAndUpdate(partnerId, { 
      rating: parseFloat(avgRating.toFixed(1)) 
    });

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error in POST /api/reviews:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
});

export default router;
