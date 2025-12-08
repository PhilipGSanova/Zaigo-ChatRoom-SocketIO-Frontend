import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, currentUserId }) {
  const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
  const isSender = senderId === currentUserId;

  console.log("sender =", senderId, "currentUser =", currentUserId, "isSender =", isSender);

  // --- Voice Message ---
  if (msg.audio) {
    return (
      <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
        <audio controls src={msg.audio}></audio>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>

      {/* Sender name */}
      {msg.sender?.fullName && (
        <span className="username">
          {msg.sender.fullName}
        </span>
      )}

      {/* Text message */}
      {msg.text && <span className="text">{msg.text}</span>}

      {/* --- Image Attachments --- */}
      {msg.attachments && msg.attachments.length > 0 &&
        msg.attachments.map((att) => (
          att.mime.startsWith("image/") && (
            <img
              key={att._id || att.filename}
              className="message-image"
              src={att.url.startsWith("http") ? att.url : `${import.meta.env.VITE_API_URL || "https://zaigo-chatroom-socketio-backend.onrender.com"}${att.url}`}
              alt={att.filename}
            />
          )
        ))
      }

      {/* Timestamp */}
      <span className="timestamp">
        {new Date(msg.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
