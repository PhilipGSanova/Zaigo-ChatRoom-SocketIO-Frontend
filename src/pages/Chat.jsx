import React, { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "./Chat.css";

export default function Chat() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState("69292e93d4ac2dfa35e720db");
  const [messages, setMessages] = useState([]);

  // Initialize socket
  useEffect(() => {
    if (!token) return;
    const s = connectSocket(token);
    setSocket(s);
    return () => s.disconnect();
  }, [token]);

  // Load messages & handle socket events
  useEffect(() => {
    if (!socket || !currentRoom) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${currentRoom._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
          }
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    // Join the room in socket
    socket.emit("join_room", { roomId: currentRoom._id });

    // Listen for new messages
    const handleNewMessage = (msg) => setMessages(prev => [...prev, msg]);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_room", { roomId: currentRoom._id });
    };
  }, [socket, currentRoom, token]);

  const handleRoomChange = (roomId, roomObj) => {
    setCurrentRoom(roomObj);
    setMessages([]); // will reload in useEffect
  };

  return (
    <div className="chat-container">
      <Sidebar currentRoom={currentRoom} onRoomChange={handleRoomChange} />
      <ChatWindow messages={messages} socket={socket} currentRoom={currentRoom} user={user} />
    </div>
  );
}
