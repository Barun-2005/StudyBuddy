import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axiosInstance.get("/friendRequests/friendsList");
        if (Array.isArray(res.data)) {
          setFriends(res.data);
        } else {
          setFriends([]);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="h-full bg-base-200">
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-6rem)] mt-16">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar friends={friends} loading={loadingFriends} />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;




