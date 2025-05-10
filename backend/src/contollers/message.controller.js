import User from "../models/user.models.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js"

const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    // Get the last message for each user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(1);
        
        return {
          ...user.toObject(),
          lastMessage: lastMessage ? (lastMessage.text || 'Sent an image') : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : null
        };
      })
    );
    
    // Sort users by most recent message
    usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json(usersWithLastMessage);
  }
  catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const getMessages = async (req, res) => {
    try {
      const { id: userToChatWithId } = req.params;
      const myId = req.user._id;
      
      if (!myId || !userToChatWithId) {
        return res.status(400).json({ error: "Invalid user IDs" });
      }

      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatWithId }, 
          { senderId: userToChatWithId, receiverId: myId },
        ],
      }).sort({ createdAt: 1 });

      res.status(200).json(messages);
    } 
    catch (err) {
      console.error("Error in getMessages controller: ", err.message);
      res.status(500).json({ error: "Internal server error fetching messages" });
    }
  };

export const sendMessages = async (req,res) => {
  try {
    const { id: receiverId } = req.params;
    const { text } = req.body;
    const imageFile = req.body.image;
    const senderId = req.user._id;

    let imageUrl = null;

    if (imageFile) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(imageFile);
            imageUrl = uploadResponse.secure_url;

        }
        catch (uploadError) {
            console.error("Cloudinary Upload Error: ", uploadError.message);
            return res.status(500).json({ error: "Failed to upload image. Please try again." });
        }
    }

    if (!text && !imageUrl) {
        return res.status(400).json({ error: "Message content cannot be empty (must have text or image)." });
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text: text || null,
        image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);

} 
catch (err) {
    console.error("Error in sendMessage controller: ", err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error sending message" });
}
};

export default getUsersForSideBar;