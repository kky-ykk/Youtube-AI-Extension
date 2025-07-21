// API utility functions for communication with backend
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async initializeAgent(videoUrl) {
    try {
      console.log('Initializing AI agent for video:', videoUrl);
      
      const response = await fetch(`${this.baseUrl}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Initialization response:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error initializing agent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async askQuestion(question) {
    try {
      console.log('Asking question:', question);
      
      const response = await fetch(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Question response:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error asking question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility method to check if the backend is reachable
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;