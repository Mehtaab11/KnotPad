import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from 'http'
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const app = express()
app.use(cors())


const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'localhost:3000',
        methods: ['POST', 'GET']
    }
})

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));

io.on('connection ', (socket) => {
    console.log("A Client Connected", socket.id)

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    })

})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});