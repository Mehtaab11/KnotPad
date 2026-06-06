import express from "express"
import { register, login, profile } from "../controllers/userController.js"
import { authMiddleware } from "../middlewares/authmiddleware.js";


const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);

export default router