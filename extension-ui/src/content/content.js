// Content script to detect YouTube video URLs and communicate with popup
console.log('YouTube AI Assistant content script loaded');

let currentVideoUrl = null;
let isVideoDetected = false;
let urlCheckInterval = null;

// Function to extract video URL and video ID
function getCurrentVideoUrl() {
  const url = window.location.href;
  if (url.includes('youtube.com/watch')) {
    return url;
  }
  return null;
}

// Function to extract video ID from URL
function getVideoId(url) {
  const match = url.match(/[?&]v=([^&#]*)/);
  return match ? match[1] : null;
}

// Function to detect when a new video is loaded
function detectVideoChange() {
  const newUrl = getCurrentVideoUrl();
  
  if (newUrl) {
    const newVideoId = getVideoId(newUrl);
    const currentVideoId = currentVideoUrl ? getVideoId(currentVideoUrl) : null;
    
    // Check if it's actually a different video (not just URL parameters change)
    if (newVideoId && newVideoId !== currentVideoId) {
      console.log('New YouTube video detected:', newUrl);
      console.log('Video ID changed from:', currentVideoId, 'to:', newVideoId);
      
      currentVideoUrl = newUrl;
      isVideoDetected = true;
      
      // Send message to background script about video detection
      chrome.runtime.sendMessage({
        type: 'VIDEO_DETECTED',
        url: currentVideoUrl,
        videoId: newVideoId,
        previousVideoId: currentVideoId
      });
    } else if (newUrl !== currentVideoUrl) {
      // Same video, but URL params changed (like timestamp)
      console.log('Same video, URL updated:', newUrl);
      currentVideoUrl = newUrl;
    }
  }
}

// More robust video detection using multiple methods
function setupVideoDetection() {
  // Method 1: URL change detection
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(detectVideoChange, 100); // Small delay to ensure page is ready
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
  
  // Method 2: Periodic URL checking (fallback)
  if (urlCheckInterval) {
    clearInterval(urlCheckInterval);
  }
  
  urlCheckInterval = setInterval(() => {
    detectVideoChange();
  }, 2000); // Check every 2 seconds
  
  // Method 3: Listen for YouTube's navigation events
  window.addEventListener('yt-navigate-finish', () => {
    console.log('YouTube navigation finished');
    setTimeout(detectVideoChange, 500);
  });
  
  // Method 4: Listen for video player events
  document.addEventListener('DOMContentLoaded', () => {
    observeVideoPlayer();
  });
  
  // Initial detection
  setTimeout(detectVideoChange, 1000);
}

// Listen for video player state changes
function observeVideoPlayer() {
  const checkForVideo = () => {
    const videoElement = document.querySelector('video');
    if (videoElement && !videoElement.dataset.listenerAdded) {
      videoElement.dataset.listenerAdded = 'true';
      
      videoElement.addEventListener('loadstart', () => {
        console.log('Video loadstart event');
        setTimeout(detectVideoChange, 200);
      });
      
      videoElement.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded');
        setTimeout(detectVideoChange, 200);
      });
    }
  };
  
  // Check immediately
  checkForVideo();
  
  // Set up observer for when video element is added
  const videoObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        checkForVideo();
      }
    });
  });

  videoObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_VIDEO_URL') {
    const currentUrl = getCurrentVideoUrl();
    sendResponse({
      videoUrl: currentUrl,
      isVideoDetected: !!currentUrl,
      videoId: currentUrl ? getVideoId(currentUrl) : null
    });
  }
  
  if (request.type === 'CHECK_VIDEO_STATUS') {
    const currentUrl = getCurrentVideoUrl();
    sendResponse({
      videoUrl: currentUrl,
      isVideoDetected: !!currentUrl,
      videoId: currentUrl ? getVideoId(currentUrl) : null
    });
  }
  
  if (request.type === 'FORCE_DETECT') {
    detectVideoChange();
    sendResponse({ success: true });
  }
});

// Initialize video detection
setupVideoDetection();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (urlCheckInterval) {
    clearInterval(urlCheckInterval);
  }
});