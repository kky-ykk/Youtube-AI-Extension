import React, { useState, useRef } from 'react';

const InputBox = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="input-box"
          autoFocus
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="send-button"
          title="Send message"
        >
          {disabled ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default InputBox;