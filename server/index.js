import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import http from 'http'
import mongoose from "mongoose"
import dotenv from "dotenv"
import documentRoutes from "./routes/documentRoutes.js"

dotenv.config()
const app = express()


app.use(cors())
app.use(express.json())

// Routes
app.use('/api/v1/documents', documentRoutes);


// Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Running the app
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});