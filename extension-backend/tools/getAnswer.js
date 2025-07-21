// tools/getAnswer.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getRetriever } from "../utility/getRetriever.js";
import { llm } from "../utility/llm.js";
import { getAnswer as getAnswerFunc } from "../utility/getAnswer.js";

export const getAnswer = tool(
  async ({ question }) => {
    const retriever = await getRetriever("./transcribedText/transcript.txt");
    const answer = await getAnswerFunc(question, llm, retriever);
    return answer;
  },
  {
    name: "getAnswer",
    description: "Ask a question about the transcribed video text",
    schema: z.object({
      question: z.string(),
    }),
  }
);
