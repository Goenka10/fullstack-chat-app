import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Search, User } from "lucide-react";

const Sidebar = () => {
  const { 
    users, 
    getUsers, 
    isUsersLoading, 
    selectedUser, 
    setSelectedUser,
    onlineUsers,
    lastMessageTimes // Add this if not already in store
  } = useChatStore();
  const { authUser } = useAuthStore();

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => user._id !== authUser?._id)
    .sort((a, b) => {
      // First, put users with recent messages at the top
      const aTime = a.lastMessageTime || new Date(0);
      const bTime = b.lastMessageTime || new Date(0);
      
      // Convert to timestamp for comparison
      const aTimestamp = new Date(aTime).getTime();
      const bTimestamp = new Date(bTime).getTime();
      
      // Sort by most recent first
      return bTimestamp - aTimestamp;
    });

  if (isUsersLoading) {
    return (
      <div className="w-full md:w-96 h-full bg-base-300 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-base-content">Messages</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="animate-pulse">
            <div className="h-16 bg-base-200 rounded-lg mb-4"></div>
            <div className="h-16 bg-base-200 rounded-lg mb-4"></div>
            <div className="h-16 bg-base-200 rounded-lg mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="w-full md:w-96 h-full bg-base-300 flex flex-col">
      <div className="p-6 bg-base-300 flex-shrink-0">
        <h2 className="text-xl font-bold flex items-center text-base-content">
          <Users className="w-6 h-6 mr-3" />
          Messages
        </h2>
      </div>

      <div className="p-4 bg-base-300 flex-shrink-0">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 input input-bordered bg-base-100 text-base-content text-base"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            <Users className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">Start by adding some friends!</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAndSortedUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              
              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 flex items-center gap-4 rounded-lg transition-all ${
                    selectedUser?._id === user._id 
                      ? 'bg-primary text-primary-content' 
                      : 'bg-base-100 hover:bg-base-200 text-base-content'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full avatar">
                      <div className="bg-primary/10 w-full h-full rounded-full flex items-center justify-center">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.fullName || user.username}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.onError = null;
                              e.target.src = "";
                            }}
                          />
                        ) : (
                          <User className="w-7 h-7" />
                        )}
                      </div>
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full ring-2 ring-base-100"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-base truncate">
                        {user.fullName || user.username}
                      </h4>
                      <span className="text-xs opacity-60">
                        {formatTimeAgo(user.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm opacity-60 truncate">
                        {user.lastMessage || 'Start a conversation'}
                      </p>
                      {isOnline && (
                        <span className="text-xs text-success font-medium">Online</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
};

export default Sidebar;