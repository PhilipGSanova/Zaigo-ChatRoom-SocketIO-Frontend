import React, { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

export default function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialize socket
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  // Load messages + listen to socket events
  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Load existing messages from DB
    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${currentRoom._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };

    loadMessages();

    // Join room
    socket.emit("join_room", { roomId: currentRoom._id });

    // When server sends any new message
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_voice_message", handleNewMessage);
    socket.on("new_image_message", handleNewMessage);

    // Cleanup
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_voice_message", handleNewMessage);
      socket.off("new_image_message", handleNewMessage);

      socket.emit("leave_room", { roomId: currentRoom._id });
    };
  }, [socket, currentRoom, token]);

  const handleRoomChange = (roomId, roomObj) => {
    if (!roomObj) return;
    setCurrentRoom(roomObj);
    setMessages([]); // Reset, will reload
  };

  return (
    <div className="chat-container">
      <Sidebar currentRoom={currentRoom} onRoomChange={handleRoomChange} />
      <ChatWindow
        messages={messages}
        socket={socket}
        currentRoom={currentRoom}
        user={user}
      />
    </div>
  );
}
