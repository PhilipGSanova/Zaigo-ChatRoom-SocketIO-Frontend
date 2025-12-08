import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatWindow.css";

export default function ChatWindow({ messages, socket, currentRoom, user }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { roomId: currentRoom._id, text });
    setText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentRoom) return <div className="chat-window">Select a room or friend to start chatting</div>;

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Audio = reader.result;

          socket.emit("send_voice_message", {
            roomId: currentRoom._id,
            audio: base64Audio,
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        {currentRoom.isPrivate 
          ? currentRoom.members.find(m => m._id !== user._id)?.fullName || "Direct Chat"
          : currentRoom.name
        }
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} currentUserId={user?._id || user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
        <button className="mic-btn" onMouseDown={startRecording} onMouseUp={stopRecording}>🎤</button>
      </div>
    </div>
  );
}
