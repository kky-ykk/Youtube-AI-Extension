# 🎥 AI Assistant for YouTube Videos – Chrome Extension

This project is a **Google Chrome Extension** built to help users interact with YouTube videos using AI. The extension activates on any YouTube video and allows users to **ask questions** about the video's content, making it easier to **locate specific topics or concepts** in long-form educational videos.

---

## 🚀 Problem Solved

YouTube is an incredible source for learning, but long videos often make it hard to find whether a specific topic is discussed. This extension solves that problem by allowing users to **ask direct questions** and receive **AI-generated answers** based on the video's content.

---

## ⚙️ How It Works

### 🧠 Backend (Node.js + Langchain)

1. **Video URL Detection**: Backend receives YouTube video URL via API.
2. **Audio Extraction**: The video is processed to extract its audio.
3. **Transcription**: Audio is transcribed to text using a custom NPM package:  
  [`transcribe2texts`](https://www.npmjs.com/package/transcribe2texts)
4. **LangChain AI Agent**:
  - An agent is initialized using Langchain.
  - Custom tools are defined:
    - `getText`: Accesses the transcribed text.
    - `getAnswer`: Answers questions based on the transcript.
    - `getVideo`: Downloads and prepares video/audio data.
5. **API Endpoints**:
  - `POST /initialize` – Initializes the AI agent with the video URL.
  - `POST /ask` – Accepts a user question and returns an AI-generated answer.

### 🖼️ Frontend (React.js Chrome Extension)

> While the backend powers the intelligence, the frontend delivers a smooth user experience directly inside Chrome.

- Detects YouTube video pages (`youtube.com/watch`).
- Calls `initialize` API when a new video is detected.
- Displays chat interface after agent is ready.
- Supports asking follow-up questions via the `ask` API.
- Includes session persistence, scrollable chat, and loading state.

---

## 🛠️ Tech Stack

**Backend:**
- Node.js
- JavaScript
- Langchain (AI Agent)
- `transcribe2texts` (NPM package for audio transcription)

**Frontend:**
- React.js (Popup UI)
- JavaScript (Content and background scripts)
- Chrome Manifest V3

---

## 🧠 Smart Features

- **Robust YouTube Detection**: Uses multiple methods to reliably detect video changes.
- **Session Persistence**: Chat history retained across extension open/close events.
- **Cross-tab Awareness**: Background scripts coordinate multiple tabs.
- **Memory Cleanup**: Automatically clears data when navigating away from YouTube.
