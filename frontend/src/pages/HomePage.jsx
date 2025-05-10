import { useEffect } from "react";
import Sidebar from "../components/SideBar";
import ChatContainer from "../components/chatContainer";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const { initialize, disconnectSocket, clearChatData } = useChatStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (authUser) {
      console.log("User logged in, initializing chat store...");
      initialize(authUser);
    } else {
      console.log("User logged out, cleaning up...");
      disconnectSocket();
      clearChatData();
    }
    
    return () => {
      
    };
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="h-screen bg-base-200 flex items-center justify-center" data-theme={theme}>
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200" data-theme={theme}>
      <div className="flex h-full max-w-screen-2xl mx-auto shadow-xl rounded-none md:rounded-lg overflow-hidden">
        <Sidebar />
        
        <ChatContainer />
      </div>
    </div>
  );
};

export default HomePage;