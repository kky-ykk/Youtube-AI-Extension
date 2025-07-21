import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';
import apiService from '../../utils/api';

const ChatInterface = ({ videoUrl, initialMessages = [], onMessagesChange }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Initialize messages based on whether we have previous chat history
    if (initialMessages && initialMessages.length > 0) {
      console.log('Restoring chat history:', initialMessages.length, 'messages');
      setMessages(initialMessages);
    } else {
      // Add welcome message for new sessions
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai',
        content: "Hi! I'm your AI assistant for this YouTube video. I've analyzed the content and I'm ready to answer your questions about it. What would you like to know?",
        timestamp: new Date().toISOString(),
        isWelcome: true
      };
      
      setMessages([welcomeMessage]);
    }
  }, [initialMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const handleSendMessage = async (question) => {
    if (!question.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add loading message
    const loadingMessage = {
      id: `loading-${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Call the API
      const response = await apiService.askQuestion(question.trim());
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      if (response.success) {
        // Add AI response
        const aiMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: response.data.answer || response.data.response || 'I received your question but got an empty response.',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message
        const errorMessage = {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: `Sorry, I encountered an error: ${response.error}. Please try asking your question again.`,
          timestamp: new Date().toISOString(),
          isError: true
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Sorry, I encountered an unexpected error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-title">Welcome to YouTube AI Assistant!</div>
            <div className="welcome-subtitle">
              Ask me anything about this video and I'll help you understand it better.
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}
      </div>
      
      <InputBox 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask me anything about this video..."
      />
    </div>
  );
};

export default ChatInterface;