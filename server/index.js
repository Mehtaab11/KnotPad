import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from 'http'
import mongoose from "mongoose"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
// Routes and Models
import documentRoutes from "./routes/documentRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import Document from "./models/document.js"
import User from "./models/user.js"

dotenv.config()

// app initialisation
const app = express()


app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/user', userRoutes);


// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Socket intitialisation
const server = http.createServer(app)


const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'], // Added your Vite port!
        methods: ['GET', 'POST'],
    },
});
const activeRooms = {}

io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = decoded.userId
        next()
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
})

io.on("connection", (socket) => {
    // Track which room this specific socket connection is
    let currentDocumentId = null
    // console.log(`User connected via socket: ${socket.userId}`)

    socket.on("get-document", async (documentId) => {

        if (!mongoose.isValidObjectId(documentId)) {
            return socket.emit("error", "Invalid document id")
        }

        try {
            const document = await Document.findById(documentId)

            if (!document) {
                return socket.emit('error', 'Document Not Found')
            }

            const userId = socket.userId
            const docOwnerId = document.owner.toString()

            const isOwner = userId === docOwnerId
            const isCollaborator = document.collaborators.some((item) => { return item.toString() === userId })

            if (!isOwner && !isCollaborator) {
                return socket.emit('error', 'Unauthorized: You do not have access');
            }

            const userRecord = await User.findById(userId)

            const userName = userRecord ? userRecord.name : 'Anonymous'

            socket.join(documentId)
            currentDocumentId = documentId

            if (!activeRooms[documentId]) activeRooms[documentId] = []


            const isAlreadyInRoom = activeRooms[documentId].some(u => u.userId == userId.toString())
            if (!isAlreadyInRoom) {
                activeRooms[documentId].push({
                    userId: userId.toString(),
                    name: userName,
                    socketId: socket.id
                })
            }

            io.to(documentId).emit('presence-updates', activeRooms[documentId])

            socket.emit("load-document", document.content)

            socket.on("send-changes", (delta) => {
                socket.broadcast.to(documentId).emit("receive-changes", delta)
            })

            socket.on("save-changes", async (delta) => {
                await Document.findByIdAndUpdate(documentId, {
                    content: delta
                })
            })

            socket.on('save-document', async (delta) => {
                await Document.findByIdAndUpdate(documentId, { content: delta });
            });

        } catch (error) {
            return socket.emit('Error', 'Error: server Error while loading the document');
        }
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId || socket.user.id}`);

        if (currentDocumentId && activeRooms[currentDocumentId]) {
            activeRooms[currentDocumentId] = activeRooms[currentDocumentId].filter(u => u.socketId != socket.id)
            io.to(currentDocumentId).emit('presence-updates', activeRooms[currentDocumentId])
        }
    })
})

// Running the app
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});