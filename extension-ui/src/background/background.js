// Background script for Chrome extension
console.log('YouTube AI Assistant background script loaded');

let currentVideoData = {
  url: null,
  sessionId: null,
  isInitialized: false
};

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'VIDEO_DETECTED') {
    // Check if it's the same video
    const isSameVideo = currentVideoData.url === request.url;
    
    if (!isSameVideo) {
      console.log('New video detected, clearing previous session');
      // Clear previous session data for different video
      currentVideoData = {
        url: request.url,
        sessionId: null,
        isInitialized: false
      };
      
      // Clear storage for old video
      chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
    } else {
      console.log('Same video detected, keeping session');
    }
    
    // Store the video URL in storage
    chrome.storage.local.set({
      detectedVideoUrl: request.url,
      detectionTime: new Date().toISOString()
    });
    
    console.log('Video URL stored in background:', request.url);
  }
  
  if (request.type === 'GET_CURRENT_VIDEO') {
    sendResponse({
      videoUrl: currentVideoData.url,
      sessionId: currentVideoData.sessionId,
      isInitialized: currentVideoData.isInitialized
    });
  }
  
  if (request.type === 'SET_INITIALIZED') {
    currentVideoData.url = request.videoUrl;
    currentVideoData.sessionId = request.sessionId;
    currentVideoData.isInitialized = true;
    
    console.log('Session initialized:', {
      videoUrl: request.videoUrl,
      sessionId: request.sessionId
    });
  }
  
  if (request.type === 'CLEAR_SESSION') {
    console.log('Clearing session data');
    currentVideoData = {
      url: null,
      sessionId: null,
      isInitialized: false
    };
    
    chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
});

// Listen for tab updates to detect YouTube navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    console.log('YouTube video tab updated:', tab.url);
    
    // Check if user navigated to a different video
    if (currentVideoData.url && currentVideoData.url !== tab.url) {
      console.log('User navigated to different video, clearing session');
      currentVideoData = {
        url: null,
        sessionId: null,
        isInitialized: false
      };
      
      // Clear storage
      chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
    }
    
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content/content.js']
    }).catch(err => {
      // Content script might already be injected
      console.log('Content script injection result:', err);
    });
  }
});

// Clear session when user navigates away from YouTube
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.includes('youtube.com/watch')) {
    if (currentVideoData.url) {
      console.log('User navigated away from YouTube, clearing session');
      currentVideoData = {
        url: null,
        sessionId: null,
        isInitialized: false
      };
      
      chrome.storage.local.remove(['lastVideoUrl', 'isInitialized', 'sessionId', 'chatHistory']);
    }
  }
});