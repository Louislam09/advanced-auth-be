import express from "express";
import { forgotPassword, getCurrentUser, login, logout, resendVerificationEmail, resetPassword, signup, verifyEmail } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.post('/resend-verification-email', verifyToken, resendVerificationEmail);
router.get('/me', verifyToken, getCurrentUser);

export default router