import express from 'express'
import jwt from 'jsonwebtoken'


export const authMiddleware = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: "No Token" })
        }

        // Extract token from "Bearer {token}" format
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // console.log(decoded, "test")
        req.userId = decoded.userId

        next()

    } catch (error) {
        return res.status(401).json({
            message: error.message
        })
    }
}