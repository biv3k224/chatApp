import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Please enter both name and room ID");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setActiveButton("join");

    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Successfully joined the room!");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status === 400) {
        toast.error(error.response?.data || "Room not found");
      } else {
        toast.error("Error joining room. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setActiveButton(null);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setActiveButton("create");

    try {
      const response = await createRoomApi(detail.roomId);
      toast.success("Room created successfully!");
      setCurrentUser(detail.userName);
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status === 400) {
        toast.error("Room already exists. Please use a different ID.");
      } else {
        toast.error("Error creating room. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setActiveButton(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Floating card with animation */}
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-10 animate-pulse"></div>
          
          {/* Main card */}
          <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl">
            
            {/* Icon with animation */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
                <img 
                  src={chatIcon} 
                  className="w-20 h-20 transform transition duration-300 group-hover:scale-110 group-hover:rotate-3" 
                  alt="Chat"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
              Welcome to Chat Space
            </h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
              Join an existing room or create a new one
            </p>

            {/* Form */}
            <div className="space-y-6">
              {/* Name input */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    onChange={handleFormInputChange}
                    value={detail.userName}
                    type="text"
                    id="userName"
                    name="userName"
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Room ID input */}
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <input
                    name="roomId"
                    onChange={handleFormInputChange}
                    value={detail.roomId}
                    type="text"
                    id="roomId"
                    placeholder="Enter room ID"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Enter existing ID to join or new ID to create
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={joinChat}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    activeButton === "join"
                      ? "bg-blue-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  } text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {activeButton === "join" ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    "Join Room"
                  )}
                </button>

                <button
                  onClick={createRoom}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    activeButton === "create"
                      ? "bg-purple-600"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  } text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {activeButton === "create" ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Room"
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Quick Tips
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Use a unique room ID for private conversations</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Share the room ID with friends to invite them</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Your name will be visible to everyone in the room</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Start chatting in seconds. No email required.
        </p>
      </div>
    </div>
  );
};

export default JoinCreateChat;