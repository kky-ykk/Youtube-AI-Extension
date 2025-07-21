import React from 'react';

const MessageBubble = ({ message }) => {
  const { type, content, isLoading, isWelcome, isError } = message;
  
  const getMessageClass = () => {
    let className = 'message-bubble';
    
    if (type === 'user') {
      className += ' message-user';
    } else {
      className += ' message-ai';
      if (isLoading) className += ' loading';
      if (isError) className += ' error';
    }
    
    return className;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      );
    }

    if (isWelcome) {
      return (
        <div>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>
            🤖 AI Assistant Ready!
          </div>
          <div>{content}</div>
        </div>
      );
    }

    if (isError) {
      return (
        <div>
          <div style={{ marginBottom: '8px', fontWeight: '600', color: '#e74c3c' }}>
            ❌ Error
          </div>
          <div>{content}</div>
        </div>
      );
    }

    return content;
  };

  return (
    <div className={getMessageClass()}>
      {renderContent()}
    </div>
  );
};

export default MessageBubble;