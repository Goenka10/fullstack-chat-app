import Sidebar from "../components/SideBar";
import ChatContainer from "../components/chatContainer";
import { useChatStore } from "../store/useChatStore";

const ChatPage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-100">
      <div className="flex h-full overflow-hidden">
        {/* Sidebar - Show on desktop always, on mobile only when no chat selected */}
        <div className={`
          h-full
          ${selectedUser ? 'hidden md:flex' : 'flex'} 
          w-full md:w-96 
          flex-shrink-0
          border-r border-base-300
        `}>
          <Sidebar />
        </div>
        
        {/* Chat Container - Show on desktop always, on mobile only when chat selected */}
        <div className={`
          h-full 
          flex-1 
          ${!selectedUser ? 'hidden md:flex' : 'flex'}
          overflow-hidden
        `}>
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;