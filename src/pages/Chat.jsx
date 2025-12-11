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

  // ------------------- INIT SOCKET -------------------
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  // ------------------- LOAD + LISTEN -------------------
  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Load old messages
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
        console.error("Failed fetching messages:", err);
        setMessages([]);
      }
    };

    loadMessages();

    // JOIN room
    socket.emit("join_room", { roomId: currentRoom._id });

    // Receive all message types
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new_message", onMessage);
    socket.on("new_voice_message", onMessage);
    socket.on("new_image_message", onMessage);

    return () => {
      socket.off("new_message", onMessage);
      socket.off("new_voice_message", onMessage);
      socket.off("new_image_message", onMessage);

      socket.emit("leave_room", { roomId: currentRoom._id });
    };
  }, [socket, currentRoom, token]);

  // ------------------- ADD MESSAGE TO UI -------------------
  const addMessage = (newMessage, replaceTempId = null) => {
    setMessages((prev) => {
      if (replaceTempId) {
        return prev.map((m) =>
          m._id === replaceTempId ? newMessage : m
        );
      }
      return [...prev, newMessage];
    });
  };

  // ------------------- ROOM SWITCH -------------------
  const handleRoomChange = (roomId, roomObj) => {
    if (!roomObj) return;
    setCurrentRoom(roomObj);
    setMessages([]); // reset, will reload
  };

  return (
    <div className="chat-container">
      <Sidebar currentRoom={currentRoom} onRoomChange={handleRoomChange} />

      <ChatWindow
        messages={messages}
        socket={socket}
        currentRoom={currentRoom}
        user={user}
        addMessage={addMessage}
      />
    </div>
  );
}
