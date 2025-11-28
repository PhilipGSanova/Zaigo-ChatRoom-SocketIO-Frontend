import React from "react";
import "./MessageBubble.css"; // make sure this exists

export default function MessageBubble({ msg, currentUserId }) {
  const isSender = msg.userId === currentUserId;

  return (
    <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
      {msg.text}
      <span className="timestamp">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
