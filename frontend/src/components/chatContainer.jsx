import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, User, ArrowLeft, Image, X, RefreshCw, MessageCircle, Users } from "lucide-react";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { 
    selectedUser, 
    setSelectedUser, 
    getMessages, 
    sendMessage, 
    messages, 
    isMessagesLoading,
    startTyping,
    stopTyping,
    typingUsers,
    onlineUsers
  } = useChatStore();
  const { authUser } = useAuthStore();
  
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    
    getMessages(selectedUser._id);
  }, [selectedUser?._id, getMessages]);
  
  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  const isUserOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  
  const chatId = selectedUser && authUser && [authUser._id, selectedUser._id].sort().join('_');
  const userTyping = chatId && typingUsers[chatId] && 
    typingUsers[chatId].includes(selectedUser._id);

  const handleInputChange = (e) => {
    setText(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 2000);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const hours12 = (hours % 12) || 12;
    
    return `${hours12}:${minutes} ${ampm}`;
  };

  const handleBackToContacts = () => {
    stopTyping();
    setSelectedUser(null);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText && !imagePreview) return;
    
    setIsSending(true);
    
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
    
    try {
      await sendMessage({
        text: trimmedText || undefined,
        image: imagePreview,
      });
      
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const refreshMessages = async () => {
    if (!selectedUser?._id) return;
    
    setIsRefreshing(true);
    try {
      await getMessages(selectedUser._id);
      toast.success("Messages refreshed");
    } catch (error) {
      console.error("Error refreshing messages:", error);
      toast.error("Failed to refresh messages");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base-100 h-full">
        <div className="max-w-md text-center px-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold text-base-content mb-3">
            Welcome to Chat!
          </h2>
          <p className="text-lg text-base-content/60 mb-8">
            Hi {authUser?.fullName || authUser?.username}! Select a user from the sidebar to start chatting.
          </p>
          
          <div className="space-y-4 text-left bg-base-200/50 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center text-base-content">
              <Users className="w-6 h-6 mr-3 text-primary" />
              <span className="text-base">Connect with all your friends</span>
            </div>
            <div className="flex items-center text-base-content">
              <Image className="w-6 h-6 mr-3 text-primary" />
              <span className="text-base">Share photos and memories</span>
            </div>
            <div className="flex items-center text-base-content">
              <Send className="w-6 h-6 mr-3 text-primary" />
              <span className="text-base">Real-time messaging</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100 h-full">
      <div className="p-6 bg-base-100 flex items-center justify-between border-b border-base-300">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden btn btn-ghost btn-circle btn-sm"
            onClick={handleBackToContacts}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="w-12 h-12 rounded-full avatar">
              <div className="bg-primary/10 w-full h-full rounded-full flex items-center justify-center">
                {selectedUser?.profilePic ? (
                  <img 
                    src={selectedUser.profilePic} 
                    alt={selectedUser.fullName || selectedUser.username} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
            </div>
            {isUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-100"></div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-base-content">
              {selectedUser?.fullName || selectedUser?.username}
            </h3>
            <p className="text-sm text-base-content/60">
              {userTyping ? 'typing...' : isUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <button 
          className="btn btn-ghost btn-circle btn-sm"
          onClick={refreshMessages}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-base-100 p-6">
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-base-content mb-2">No messages yet</h3>
            <p className="text-base text-base-content/60">
              Start chatting with {selectedUser?.fullName || selectedUser?.username}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => {
              if (!msg.text && !msg.image) return null;
              
              const isMine = msg.senderId === authUser?._id;
              
              return (
                <div key={msg._id} className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-image avatar">
                    <div className="w-12 rounded-full">
                      {isMine ? (
                        authUser?.profilePic ? (
                          <img src={authUser.profilePic} alt={authUser.fullName} />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                        )
                      ) : (
                        selectedUser?.profilePic ? (
                          <img src={selectedUser.profilePic} alt={selectedUser.fullName} />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="chat-header text-xs opacity-50 mb-1">
                    {formatMessageTime(msg.createdAt)}
                  </div>
                  
                  <div className={`chat-bubble text-base p-4 ${
                    isMine 
                      ? 'chat-bubble-primary text-primary-content' 
                      : 'chat-bubble-secondary text-secondary-content'
                  }`}>
                    {msg.text && <p>{msg.text}</p>}
                    
                    {msg.image && (
                      <div className={msg.text ? "mt-2" : ""}>
                        <img 
                          src={msg.image} 
                          alt="Message attachment" 
                          className="max-w-[250px] rounded-lg cursor-pointer"
                          onClick={() => window.open(msg.image, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-base-100 border-t border-base-300">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg opacity-100"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-error-content
                flex items-center justify-center"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className={`w-5 h-5 ${imagePreview ? "text-primary" : "text-base-content/60"}`} />
          </button>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          
          <input
            type="text"
            className="flex-1 input input-bordered bg-base-200 text-base placeholder:text-base"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            disabled={isSending}
          />
          
          <button 
            type="submit"
            className="btn btn-primary btn-circle btn-sm"
            disabled={(!text.trim() && !imagePreview) || isSending}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;