import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = ({ friends, loading: friendsLoading }) => {
  // If friends prop is provided, we use it; otherwise, use the existing chat store logic.
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Only call getUsers if we are not provided with a friend list
  useEffect(() => {
    if (!friends) {
      getUsers();
    }
  }, [getUsers, friends]);

  // Determine which list to display:
  let displayUsers = [];
  if (friends) {
    displayUsers = friends;
  } else {
    // Filter the users from the chat store if the "online only" toggle is active
    displayUsers = showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users;
  }

  // Use the provided loading flag if available; otherwise, use the chat store loading state
  const loading = typeof friendsLoading === "boolean" ? friendsLoading : isUsersLoading;

  if (loading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Show online filter toggle only if we are not displaying a custom friends list */}
        {!friends && (
          <div className="mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {displayUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {displayUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {friends ? "No friends to display." : "No online users"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
