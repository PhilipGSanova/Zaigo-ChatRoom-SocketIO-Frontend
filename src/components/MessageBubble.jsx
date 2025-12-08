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
      {msg.attachments?.length > 0 &&
        msg.attachments.map((att, index) =>
          att.mime?.startsWith("image/") ? (
            <img
              key={index}
              src={
                att.url.startsWith("data")
                  ? att.url // base64 voice/image
                  : `${import.meta.env.VITE_API_URL}${att.url}` // backend URL
              }
              alt={att.filename || "image"}
              className="message-image"
            />
          ) : null
        )}

      {/* Timestamp */}
      <span className="timestamp">
        {new Date(msg.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
