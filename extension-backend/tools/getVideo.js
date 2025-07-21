// tools/getVideo.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { downloadYoutubeVideo } from "../utility/downloadVideo.js";

export const getVideo = tool(
  async ({ url }) => {
    await downloadYoutubeVideo(url);
    return `Video downloaded successfully from URL: ${url}`;
  },
  {
    name: "getVideo",
    description: "Download YouTube video by URL",
    schema: z.object({
      url: z.string().url(),
    }),
  }
);
