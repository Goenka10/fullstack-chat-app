import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        if(!decoded)
        {
            return res.status(401).json({ message: "Not authorized, Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } 

    catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
}