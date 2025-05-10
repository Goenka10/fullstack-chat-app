import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./Routes/auth.route.js"
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js"
import messageRoutes from "./Routes/message.route.js"
import cors from "cors"
import { app, server } from "./lib/socket.js";

import path from "path";

dotenv.config();
const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// API routes FIRST
app.use("/api/auth" , authRoutes);
app.use("/api/messages" , messageRoutes);

// Production static files
if(process.env.NODE_ENV==="production")
{
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    
    // Catch-all handler should be LAST
    app.get("*", (req, res) => {
        // Make sure this doesn't match API routes
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
        }
    })
}

server.listen(PORT , () => {
    console.log("Listening on PORT:" + PORT)
    connectDB(); 
})