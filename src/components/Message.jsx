import React from 'react';

function Message({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="message" onClick={onClose}>
      {message}
    </div>
  );
}

export default Message;
