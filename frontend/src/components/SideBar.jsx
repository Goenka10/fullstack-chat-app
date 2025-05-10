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
    onlineUsers
  } = useChatStore();
  const { authUser } = useAuthStore();

  const filteredUsers = users.filter(user => user._id !== authUser?._id);

  if (isUsersLoading) {
    return (
      <div className="w-full md:w-96 h-full bg-base-300">
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
    <div className="w-full md:w-96 h-full bg-base-300 overflow-hidden">
      <div className="p-6 bg-base-300">
        <h2 className="text-xl font-bold flex items-center text-base-content">
          <Users className="w-6 h-6 mr-3" />
          Messages
        </h2>
      </div>

      <div className="p-4 bg-base-300">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 input input-bordered bg-base-100 text-base-content text-base"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-base-content/60">
            <Users className="w-16 h-16 mx-auto mb-3 text-base-content/30" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">Start by adding some friends!</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredUsers.map((user) => {
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
                        {user.lastMessageTime || 'Now'}
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

export default Sidebar;