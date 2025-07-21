
import { llm } from "../utility/llm.js";
import { tools } from "../tools/index.js";
// import { StateGraph, MessagesAnnotation } from "langgraph";
// import { ToolNode } from "langgraph";
import { config } from "dotenv";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { systemPrompt } from "../prompts/system-promt.js";

config();

const llmWithTools = llm.bindTools(tools);

async function llmCall(state) {
  const result = await llmWithTools.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    ...state.messages,
  ]);
  return { messages: [...state.messages, result] };
}

function shouldContinue(state) {
  const last = state.messages.at(-1);
  return last?.tool_calls?.length ? "Action" : "__end__";
}

export const agent = new StateGraph(MessagesAnnotation)
  .addNode("llmCall", llmCall)
  .addNode("tools", new ToolNode(tools))
  .addEdge("__start__", "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, {
    Action: "tools",
    __end__: "__end__",
  })
  .addEdge("tools", "llmCall")
  .compile();
