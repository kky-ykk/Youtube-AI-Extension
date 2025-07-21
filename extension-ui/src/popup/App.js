import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import ChatInterface from './components/ChatInterface';
import apiService from '../utils/api';

const App = () => {
  const [currentState, setCurrentState] = useState('checking'); // 'checking', 'loading', 'chat', 'error'
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Check if we're on YouTube and get video URL
  useEffect(() => {
    checkYouTubeVideo();
  }, []);

  const checkYouTubeVideo = async () => {
    try {
      // Get current active tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url || !tab.url.includes('youtube.com/watch')) {
        setError('Please open a YouTube video to use this extension.');
        setCurrentState('error');
        return;
      }

      const currentVideoUrl = tab.url;
      
      // Check if we have stored data for this specific video
      const result = await chrome.storage.local.get([
        'lastVideoUrl', 
        'isInitialized', 
        'sessionId', 
        'chatHistory'
      ]);
      
      setVideoUrl(currentVideoUrl);

      // Check if it's the same video as before
      const isSameVideo = result.lastVideoUrl === currentVideoUrl;
      const hasValidSession = result.isInitialized && result.sessionId;
      
      console.log('Video check:', {
        currentVideoUrl,
        lastVideoUrl: result.lastVideoUrl,
        isSameVideo,
        hasValidSession,
        isInitialized: result.isInitialized
      });

      if (isSameVideo && hasValidSession) {
        // Same video and already initialized - restore chat state
        console.log('Restoring previous session for same video');
        setIsInitialized(true);
        setCurrentState('chat');
        
        // Restore chat history if available
        if (result.chatHistory && Array.isArray(result.chatHistory)) {
          setChatMessages(result.chatHistory);
        }
      } else {
        // Different video or no previous session - initialize new session
        console.log('New video detected, initializing...');
        
        // Clear old session data
        await chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
        
        setCurrentState('loading');
        await initializeAgent(currentVideoUrl);
      }
    } catch (err) {
      console.error('Error checking YouTube video:', err);
      setError('Failed to detect YouTube video. Please try again.');
      setCurrentState('error');
    }
  };

  const initializeAgent = async (url) => {
    try {
      setCurrentState('loading');
      setError(null);
      
      const response = await apiService.initializeAgent(url);
      
      if (response.success) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setIsInitialized(true);
        setCurrentState('chat');
        
        // Store session data for this specific video
        await chrome.storage.local.set({
          lastVideoUrl: url,
          isInitialized: true,
          sessionId: sessionId,
          initializationTime: new Date().toISOString(),
          chatHistory: [] // Initialize empty chat history
        });
        
        console.log('New session created:', sessionId, 'for video:', url);
        
        // Notify background script
        chrome.runtime.sendMessage({
          type: 'SET_INITIALIZED',
          videoUrl: url,
          sessionId: sessionId
        });
      } else {
        throw new Error(response.error || 'Failed to initialize AI agent');
      }
    } catch (err) {
      console.error('Error initializing agent:', err);
      setError(`Failed to initialize AI agent: ${err.message}`);
      setCurrentState('error');
    }
  };

  const handleRetry = async () => {
    setError(null);
    // Clear any cached data before retrying
    await chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
    await checkYouTubeVideo();
  };

  // Function to save chat messages to storage
  const saveChatHistory = async (messages) => {
    try {
      await chrome.storage.local.set({
        chatHistory: messages
      });
      console.log('Chat history saved:', messages.length, 'messages');
    } catch (err) {
      console.error('Error saving chat history:', err);
    }
  };

  const renderContent = () => {
    switch (currentState) {
      case 'checking':
        return <LoadingScreen message="Checking YouTube video..." />;
      
      case 'loading':
        return <LoadingScreen message="Initializing AI Agent..." />;
      
      case 'chat':
        return (
          <ChatInterface 
            videoUrl={videoUrl} 
            initialMessages={chatMessages}
            onMessagesChange={saveChatHistory}
          />
        );
      
      case 'error':
        return (
          <div className="error-screen">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        );
      
      default:
        return <LoadingScreen message="Loading..." />;
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        AI Assistant for YouTube
      </div>
      {renderContent()}
    </div>
  );
};

export default App;