import User from "../models/user.models.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signUp = async (req,res) => {
    const {fullName, email, password} = req.body;

    try{
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if(password.length < 6) {
            return res.status(400).json({message : "Password must be at least 6 characters long."})
        }
        
        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            fullName,
            email,
            password: hashPassword
        });

        if(newUser)
        {
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
              });
        }
        else{
            res.status(400).json({message: "Invaid User Data"});
        }
    }

    catch(err) {
        console.log("Error in signup controller", err.message)
        res.status(500).json({message: "Internal Server Error"});   
    }
};

export const login =  async (req,res) => {
    const {email,password} = req.body;

    try{
        const user = await User.findOne({email});

        if(!user)
        { 
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect)
        {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
          });
    }
    catch (err){
        console.log("Error in Login Controller", err.message)
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const logout = (req,res) => {
    try {
        res.cookie("jwt" , "" , {maxAge: 0})
        res.status(200).json({message: "Logged Out Successfully"});
    } catch (err) {
        console.log("Error in Logout Controller", err.message)
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;

        const userId = req.user._id;

        if(!profilePic)
        {
            return res.status(400).json({message: "Profile Pic is Required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId , {profilePic: uploadResponse.secure_url} , {new:true})

        res.status(200).json({message: "Updated Profile Pic"})

    }
    catch (err) {
        console.log("Error in Logout Controller", err.message)
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    }
    catch (error) {
        console.log("Error in checkAuth" , error.message)
        res.status(500).json({message: "Internal Server Error "})    
    }
}



