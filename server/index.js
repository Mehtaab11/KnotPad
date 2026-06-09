import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from 'http'
import mongoose from "mongoose"
import dotenv from "dotenv"
import documentRoutes from "./routes/documentRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import Document from "./models/document.js"

dotenv.config()
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
        origin: ' http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

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
    console.log(`User connected via socket: ${socket.userId}`)

    socket.on("get-document", async (documentId) => {
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

            socket.join(documentId)

            socket.emit("load-document", document)


            socket.on("send-changes", (data) => {
                socket.broadcast.to(documentId).emit("receive-changes", data)
            })

            socket.on("save-changes", async (data) => {
                await Document.findByIdAndUpdate(documentId, {
                    content: data
                })
            })

        } catch (error) {

            return next(new Error('Error: server Error while loading the document'));
        }
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId || socket.user.id}`);
    })
})



// Running the app
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});