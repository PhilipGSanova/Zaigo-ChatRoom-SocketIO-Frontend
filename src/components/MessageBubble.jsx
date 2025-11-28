import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, currentUserId }) {
  const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
const normalizedSenderId = senderId?.toString();
const normalizedCurrentUserId = currentUserId?.toString();

const isSender = normalizedSenderId === normalizedCurrentUserId;
console.log("sender =", senderId, "currentUser =", currentUserId, "isSender =", isSender);

  return (
    <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
      <span className="username">{msg.sender.username}: </span>
      <span className="text">{msg.text}</span>
      <span className="timestamp">
        {new Date(msg.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
