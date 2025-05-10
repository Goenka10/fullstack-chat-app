import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import io from 'socket.io-client';
import { useAuthStore } from "./useAuthStore";

const BASE_URL = import.meta.env.MODE === "development" ? 'http://localhost:3000': window.location.origin;

export const useChatStore = create()(
  persist(
    (set, get) => ({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      socket: null,
      onlineUsers: [],
      typingUsers: {},
      
      // Function to update user's last message info
      updateUserLastMessage: (userId, message) => {
        const { users } = get();
        const updatedUsers = users.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              lastMessage: message.text || 'Sent an image',
              lastMessageTime: message.createdAt || new Date().toISOString()
            };
          }
          return user;
        });
        set({ users: updatedUsers });
      },
      
      initSocket: (authUser) => {
        if (!authUser) return;

        const { socket } = get();
        if (socket?.connected) return;

        const newSocket = io(BASE_URL);
        
        newSocket.on('connect', () => {
          console.log('Socket connected');
          newSocket.emit('setup', authUser._id);
        });
        
        newSocket.on('messageReceived', (newMessage) => {
          const { selectedUser, messages, updateUserLastMessage } = get();

          const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser?._id;
          
          if (selectedUser &&   
              (newMessage.senderId === selectedUser._id || 
               newMessage.receiverId === authUser._id)) {
            
            const messageExists = messages.some(msg => msg._id === newMessage._id);
            if (!messageExists) {
              set({ messages: [...messages, newMessage] });
            }
          }
          
          // Update the user's last message info in the sidebar
          updateUserLastMessage(newMessage.senderId, newMessage);
        });
        
        newSocket.on('userOnline', (userId) => {
          const { onlineUsers, users } = get();
          if (!onlineUsers.includes(userId)) {
            set({ onlineUsers: [...onlineUsers, userId] });
          }
          const updatedUsers = users.map(user => 
            user._id === userId ? { ...user, isOnline: true } : user
          );
          set({ users: updatedUsers });
        });
        
        newSocket.on('userOffline', (userId) => {
          const { onlineUsers, users } = get();
          set({ onlineUsers: onlineUsers.filter(id => id !== userId) });
          const updatedUsers = users.map(user => 
            user._id === userId ? { ...user, isOnline: false } : user
          );
          set({ users: updatedUsers });
        });
        
        newSocket.on('onlineUsers', (users) => {
          set({ onlineUsers: users });
        });
        
        newSocket.on('typing', ({ chatId, userId }) => {
          const { typingUsers } = get();
          const updatedTypingUsers = { ...typingUsers };
          if (!updatedTypingUsers[chatId]) {
            updatedTypingUsers[chatId] = [];
          }
          if (!updatedTypingUsers[chatId].includes(userId)) {
            updatedTypingUsers[chatId].push(userId);
          }
          set({ typingUsers: updatedTypingUsers });
        });
        
        newSocket.on('stopTyping', ({ chatId, userId }) => {
          const { typingUsers } = get();
          const updatedTypingUsers = { ...typingUsers };
          if (updatedTypingUsers[chatId]) {
            updatedTypingUsers[chatId] = updatedTypingUsers[chatId].filter(id => id !== userId);
            if (updatedTypingUsers[chatId].length === 0) {
              delete updatedTypingUsers[chatId];
            }
          }
          set({ typingUsers: updatedTypingUsers });
        });
        
        set({ socket: newSocket });
      },
      
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, onlineUsers: [], typingUsers: {} });
        }
      },
      
      joinChat: (otherUserId) => {
        const { socket } = get();
        const authUser = useAuthStore.getState()?.authUser;
        if (socket && authUser) {
          const chatId = [authUser._id, otherUserId].sort().join('_');
          socket.emit('joinChat', chatId);
        }
      },
      
      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          // Initialize lastMessageTime if not present
          const usersWithTimestamp = res.data.map(user => ({
            ...user,
            lastMessageTime: user.lastMessageTime || '',
            lastMessage: user.lastMessage || ''
          }));
          set({ users: usersWithTimestamp });
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error(error.response?.data?.message || "Failed to load users");
        } finally {
          set({ isUsersLoading: false });
        }
      },
      
      getMessages: async (userId) => {
        if (!userId) return;
        
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
          
          get().joinChat(userId);
          
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error(error.response?.data?.message || "Failed to load messages");
          set({ messages: [] });
        } finally {
          set({ isMessagesLoading: false });
        }
      },
      
      sendMessage: async (messageData) => {
        const { selectedUser, messages, socket, updateUserLastMessage } = get();
        const authUser = useAuthStore.getState()?.authUser;
        
        if (!selectedUser) {
          toast.error("Please select a user to chat with");
          return { success: false, error: "No user selected" };
        }
        
        if (!messageData.text && !messageData.image) {
          return { success: false, error: "Cannot send empty message" };
        }
        
        try {
          const payload = {
            ...(messageData.text && messageData.text.trim() && { text: messageData.text.trim() }),
            ...(messageData.image && { image: messageData.image }),
          };
          
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
          
          const messageExists = messages.some(msg => msg._id === res.data._id);
          if (!messageExists) {
            set({ messages: [...messages, res.data] });
          }
          
          // Update the last message info for this user
          updateUserLastMessage(selectedUser._id, res.data);
          
          if (socket && authUser) {
            socket.emit('newMessage', {
              ...res.data,
              senderId: authUser._id,
              receiverId: selectedUser._id
            });
          }
          
          return { success: true, data: res.data };
        } catch (error) {
          console.error("Send message error:", error);
          toast.error(error.response?.data?.message || "Failed to send message");
          return { success: false, error: error.message };
        }
      },
      
      startTyping: () => {
        const { socket, selectedUser } = get();
        const authUser = useAuthStore.getState()?.authUser;
        
        if (socket && selectedUser && authUser) {
          const chatId = [authUser._id, selectedUser._id].sort().join('_');
          socket.emit('typing', { chatId, userId: authUser._id });
        }
      },
      
      stopTyping: () => {
        const { socket, selectedUser } = get();
        const authUser = useAuthStore.getState()?.authUser;
        
        if (socket && selectedUser && authUser) {
          const chatId = [authUser._id, selectedUser._id].sort().join('_');
          socket.emit('stopTyping', { chatId, userId: authUser._id });
        }
      },
      
      setSelectedUser: (selectedUser) => {
        const { stopTyping } = get();
        stopTyping();
        
        set({ selectedUser });
        
        if (selectedUser?._id) {
          get().getMessages(selectedUser._id);
        }
      },
      
      clearChatData: () => {
        set({
          messages: [],
          users: [],
          selectedUser: null,
          onlineUsers: [],
          typingUsers: {}
        });
      },
      
      initialize: async (authUser) => {
        get().initSocket(authUser);
        
        await get().getUsers();
        
        console.log("Chat store initialized");
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ 
        selectedUser: state.selectedUser 
      })
    }
  )
);