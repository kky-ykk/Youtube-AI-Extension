// tools/getText.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { transcribe } from "../utility/transcribe.js";

export const getText = tool(
  async ({ url }) => {
    console.log(`Transcribing video at URL: ${url}`);
    await transcribe(url);
    return `Video at URL ${url} transcribed and text saved.`;
  },
  {
    name: "getText",
    description: "Download YouTube video by URL.Download, extract audio and transcribe video text by URL",
    schema: z.object({
      url: z.string().url(),
    }),
  }
);
