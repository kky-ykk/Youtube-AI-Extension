import express from "express";
import { agent } from "./graph/graph.js";
import fs from "fs";

const app = express();

app.use(express.json());

let result = null;

app.get("/", async (req, res) => {
  return res.status(200).json({
    message: "Youtube-QA-AGENT!"
  });
});

app.post("/initialize", async (req, res) => {
  try {
    console.log("url:", req.body); 
    const url = req.body.url;
    const initialMessages = [
      {
        role: "user",
        content: `h${url}`,
      },
    ];

    result = await agent.invoke(
      { messages: initialMessages },
      {
        runName: "Transcription Step",
        metadata: { user: "demo-user" },
      }
    );

    const response = result.messages.at(-1)?.content;

    const videoPath = `./videos/video.mp4`;
    const audioPath = `./audio/sample.wav`;
    
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    } 

    return res.status(200).json({
      message: "success",
      response
    });
  } catch (error) {
    console.error("Error in /initialize:", error);
    return res.status(500).json({ message: "Error in /initialize", error: error?.message });
  }
});

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;
    const followUpMessages = [
      ...result.messages,
      {
        role: "user",
        content: question,
      },
    ];

    result = await agent.invoke(
      { messages: followUpMessages },
      {
        runName: "QA",
        metadata: { user: "demo-user" },
      }
    );

    const response = result.messages.at(-1)?.content;

    return res.status(200).json({
      message: "success",
      response
    });
  } catch (error) {
    console.error("Error in /ask:", error);
    return res.status(500).json({ message: "Error in /ask", error: error?.message });
  }
});

app.listen(3000, () => {
  console.log("connected to 3000 port!");
});
