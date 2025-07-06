import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { initiateCall, respondToCall } from "../controllers/call.controller.js";

const router = express.Router();

router.post("/initiate", protectRoute, initiateCall);
router.post("/respond", protectRoute, respondToCall);

export default router;