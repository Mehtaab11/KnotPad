import express from 'express'
import jwt from 'jsonwebtoken'


export const authMiddleware = async (req, res, next) => {
    try {

        const token = req.headers.authorization

        if (!token) {
            return res.status(401).json({ message: "No Token" })
        }

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