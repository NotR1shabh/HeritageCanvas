import React from 'react';
import './ChatLauncher.css';

export default function ChatLauncher({ onOpen }) {
  return (
    <div className="chat-launcher">
      <button className="chat-launcher-btn" title="Open chat" aria-label="Open chat" onClick={onOpen}>💬</button>
    </div>
  );
}
