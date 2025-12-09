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
      {msg.sender?.fullName && <span className="username">{msg.sender.fullName}</span>}

      {/* Text message */}
      {msg.text && <span className="text">{msg.text}</span>}

      {/* --- Image Attachments --- */}
      {msg.attachments && msg.attachments.length > 0 &&
        msg.attachments.map((att) => {
          if (att.mime.startsWith("image/")) {
            return (
              <img
                key={att._id || att.filename}
                className="message-image"
                src={att.url}
                alt={att.filename || "image"}
              />
            );
          }
          return null; // important for non-image attachments
        })
      }

      {/* Timestamp */}
      <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
    </div>
  );
}
