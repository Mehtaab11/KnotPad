import express from "express"
import { register, login, profile, updateProfile } from "../controllers/userController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfile);

export default router