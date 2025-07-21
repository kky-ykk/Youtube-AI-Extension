import youtubeDl from 'youtube-dl-exec';

export async function downloadYoutubeVideo(youtubeVideoUrl) {
  const outputFilePath = './videos/video.mp4';

  console.log("Retrieving video info from YouTube...");

  const videoInfo = await youtubeDl(youtubeVideoUrl, {
    dumpSingleJson: true,
    addHeader: ["referer:youtube.com", "user-agent:googlebot"],
  });

  if (typeof videoInfo !== "object" || !videoInfo.formats) {
    throw new Error("Failed to get video info or formats");
  }

  // Find best video+audio format (not just audio)
  const videoFormat = videoInfo.formats
    .reverse()
    .find(
      (format) =>
        format.vcodec !== "none" && format.acodec !== "none" && format.ext === "mp4"
    );

  console.log("Selected video format:", videoFormat);

  if (!videoFormat || !videoFormat.url) {
    throw new Error("No suitable video format found");
  }

  console.log("Downloading video file...");

  // Use youtube-dl again to actually download to file
  await youtubeDl(youtubeVideoUrl, {
    format: videoFormat.format_id,  // download the exact format we picked
    output: outputFilePath
  });

  console.log("Video downloaded to:", outputFilePath);

  return outputFilePath;
}
