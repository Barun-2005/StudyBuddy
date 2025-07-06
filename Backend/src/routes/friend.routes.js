import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { unfriendUser } from '../controllers/friend.controller.js';

const router = express.Router();

router.post('/unfriend/:userId', protectRoute, unfriendUser);

export default router;
