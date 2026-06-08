import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcryptjs"

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPass = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPass
        })

        return res.status(201).json({ message: "User Created" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const token = await jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.status(201).json({ token })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const profile = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

