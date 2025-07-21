import { agent } from "./graph/graph.js";

const initialMessages = [
  {
    role: "user",
    content: " https://youtu.be/2USUfv7klr8?si=vBvvVEvg-LVLpT-1",
  },
];

const result1 = await agent.invoke(
  { messages: initialMessages },
  {
    runName: "Transcription Step",
    metadata: { user: "demo-user" },
  }
);

console.log("\n ranscription response:\n", result1.messages.at(-1)?.content);

const followUpMessages = [
  ...result1.messages,
  {
    role: "user",
    content: "What is the main topic of this video?",
  },
];


const result2 = await agent.invoke(
  { messages: followUpMessages },
  {
    runName: "QA",
    metadata: { user: "demo-user" },
  }
);

console.log(`\n ${followUpMessages[1].content}:\n`, result2.messages.at(-1)?.content);

// ---------------------------------------------------------
// Step 3: Another follow-up question

const followUpMessages2 = [
  ...result2.messages,
  {
    role: "user",
    content: "Give me a summary in 2 sentences. Have he talk about fake embedding in that video?",
  },
];

const result3 = await agent.invoke(
  { messages: followUpMessages2 },
  {
    runName: "QA",
    metadata: { user: "demo-user" },
  }
);

console.log(`\n ${followUpMessages2[1].content}:\n`, result3.messages.at(-1)?.content);



const followUpMessages3 = [
  ...result2.messages,
  {
    role: "user",
    content: "what was my last questions?",
  },
];

const result4 = await agent.invoke(
  { messages: followUpMessages3 },
  {
    runName: "QA",
    metadata: { user: "demo-user" },
  }
);

console.log(`\n ${followUpMessages3[1].content}:\n`, result4.messages.at(-1)?.content);