import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatWindow.css";

export default function ChatWindow({ messages, socket, currentRoom, user }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { roomId: currentRoom._id, text });
    setText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentRoom) {
    return <div className="chat-window">Select a room or friend to start chatting</div>;
  }

  // Toggle recording on button click
  const toggleRecording = async () => {
    if (!recording) {
      // START recording
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

            // Emit to server
            socket.emit("send_voice_message", {
              roomId: currentRoom._id,
              audio: base64Audio,
            });

            // Optimistically add to chat immediately
            const tempMessage = {
              _id: Date.now(), // temporary id
              sender: user._id,
              text: null,
              attachments: [{ url: base64Audio, filename: "voice-message.webm", mime: "audio/webm" }],
              createdAt: new Date(),
            };

            // Assuming `messages` is state in parent component, you might need a prop function to update it
            // For example, if parent passed `setMessages`, call: setMessages(prev => [...prev, tempMessage]);
            if (typeof addMessage === "function") {
              addMessage(tempMessage);
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    } else {
      // STOP recording
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const imageInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();

    formData.append("roomId", currentRoom._id);
    formData.append("senderId", user._id);
    formData.append("attachment", file);

    try {
      const response = await fetch("http://localhost:5000/api/image-upload/image", {
        method: "POST",
        body: formData,
      });

      const message = await response.json();

      if (typeof addMessage === "function") addMessage(message);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        {currentRoom.isPrivate
          ? currentRoom.members.find(m => m._id !== user._id)?.fullName || "Direct Chat"
          : currentRoom.name}
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
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={imageInputRef}
          onChange={handleImageChange}
        />
        <button onClick={() => imageInputRef.current?.click()}>📷</button>
        <button className="mic-btn" onClick={toggleRecording}>
          {recording ? "⏹️" : "🎤"}
        </button>
        {recording && <span style={{ color: "red", marginLeft: "10px" }}>Recording…</span>}
      </div>
    </div>
  );
}
