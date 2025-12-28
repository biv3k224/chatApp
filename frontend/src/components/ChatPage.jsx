import React, { useEffect, useRef, useState } from "react";
import { MdSend, MdLogout } from "react-icons/md";
import { FiPaperclip } from "react-icons/fi";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  
  // Check if user is properly connected
  useEffect(() => {
    console.log("Current state:", { roomId, currentUser, connected });
    if (!connected || !roomId || !currentUser) {
      console.log("Redirecting to home - missing connection data");
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load messages - SIMPLIFIED VERSION
  useEffect(() => {
    console.log("=== LOAD MESSAGES EFFECT TRIGGERED ===");
    console.log("Conditions:", { connected, roomId, isLoading });
    
    if (connected && roomId) {
      loadMessages();
    }
    
    async function loadMessages() {
      console.log("Loading messages for room:", roomId);
      setIsLoading(true);
      try {
        const loadedMessages = await getMessagess(roomId);
        console.log("API Response:", loadedMessages);
        
        // Check if response is an array
        if (Array.isArray(loadedMessages)) {
          console.log(`Loaded ${loadedMessages.length} messages`);
          setMessages(loadedMessages);
        } else if (loadedMessages && typeof loadedMessages === 'object') {
          // If backend returns object with messages property
          if (Array.isArray(loadedMessages.messages)) {
            console.log(`Loaded ${loadedMessages.messages.length} messages from object`);
            setMessages(loadedMessages.messages);
          } else if (loadedMessages.content) {
            // If paginated response
            console.log(`Loaded ${loadedMessages.content.length} messages from paginated response`);
            setMessages(loadedMessages.content);
          } else {
            console.log("Response is object but no messages array found:", loadedMessages);
            setMessages([]);
          }
        } else {
          console.log("Unexpected response format:", loadedMessages);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [connected, roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current && messages.length > 0) {
      setTimeout(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }, 100);
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    console.log("=== WEBSOCKET EFFECT TRIGGERED ===");
    console.log("Conditions for WebSocket:", { connected, roomId, currentUser });
    
    if (!connected || !roomId || !currentUser) {
      console.log("WebSocket not started - missing requirements");
      return;
    }
    
    let client = null;
    
    const connectWebSocket = () => {
      console.log("Connecting WebSocket to room:", roomId);
      const sock = new SockJS(`${baseURL}/chat`);
      client = Stomp.over(sock);
      
      client.connect({}, () => {
        console.log("✅ WebSocket connected successfully");
        setStompClient(client);
        toast.success("Connected to chat!");

        // Subscribe to messages
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log("📩 New message received:", message);
          try {
            const newMessage = JSON.parse(message.body);
            console.log("Parsed message:", newMessage);
            setMessages((prev) => [...prev, newMessage]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });

      }, (error) => {
        console.error("❌ WebSocket connection error:", error);
        toast.error("Failed to connect to chat");
      });
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket...");
      if (client && client.connected) {
        try {
          client.disconnect();
          console.log("WebSocket disconnected");
        } catch (error) {
          console.error("Error during disconnect:", error);
        }
      }
    };
  }, [roomId, connected, currentUser]);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    if (!stompClient || !stompClient.connected) {
      toast.error("Not connected to chat");
      return;
    }
    
    console.log("Sending message:", input);
    const message = {
      sender: currentUser,
      content: input.trim(),
      roomId: roomId,
      timestamp: new Date().toISOString()
    };

    try {
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      console.log("✅ Message sent successfully");
      setInput("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...");
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
    
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    setMessages([]);
    toast.success("Left the room successfully");
    navigate("/");
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Room Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">#</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                  Room: {roomId}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Welcome,
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {currentUser}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                  {currentUser?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Leave Room Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-md"
              >
                <MdLogout className="w-5 h-5" />
                <span>Leave Room</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Messages - Main Content */}
          <div className="flex-1">
            <div 
              ref={chatBoxRef}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-[calc(100vh-180px)] overflow-y-auto p-4 md:p-6"
            >
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Room: {roomId}
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-4">
                    <span className="text-4xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    Be the first to start the conversation in <span className="font-bold">{roomId}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Send a message to begin chatting
                  </p>
                </div>
              )}

              {/* Messages List */}
              {!isLoading && messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender === currentUser;
                    return (
                      <div
                        key={index}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                          <div className="flex items-start space-x-3">
                            {/* Avatar for others */}
                            {!isCurrentUser && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                                  {message.sender?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`relative px-4 py-3 rounded-2xl ${
                                isCurrentUser
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                              } shadow-sm`}
                            >
                              {/* Sender name for others' messages */}
                              {!isCurrentUser && (
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                  {message.sender}
                                </p>
                              )}
                              
                              <p className="text-sm break-words">{message.content}</p>
                              <div className={`text-xs mt-2 flex items-center justify-end ${
                                isCurrentUser ? "text-blue-100" : "text-gray-500"
                              }`}>
                                <span>{timeAgo(message.timeStamp || message.timestamp || new Date().toISOString())}</span>
                              </div>
                            </div>

                            {/* Avatar for current user */}
                            {isCurrentUser && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                  {message.sender?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  {/* Attachment Button */}
                  <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                    <FiPaperclip className="w-5 h-5" />
                  </button>

                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      type="text"
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className={`p-3 rounded-xl font-medium transition-all duration-300 ${
                      input.trim() && !isLoading
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <MdSend className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Press Enter to send • Messages: {messages.length}
                </p>
              </div>
            </div>
          </div>

          {/* Room Info Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Room Information
              </h3>
              
              <div className="space-y-4">
                {/* Current User */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {currentUser?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {currentUser}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">You</p>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Room ID</p>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-mono text-sm text-gray-800 dark:text-white truncate">
                        {roomId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">
                        {messages.length}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {connected ? 'Live' : 'Off'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
                  >
                    <MdLogout className="w-5 h-5" />
                    <span>Leave Room</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom scrollbar */}
      <style jsx>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;