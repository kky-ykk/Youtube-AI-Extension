import { extractAudio, transcribeAudio } from "transcribe2texts";
import { downloadYoutubeVideo } from "./downloadVideo.js";
import { writeFile } from "fs/promises";

export async function transcribe(videoUrl){

    await downloadYoutubeVideo(videoUrl);
    await extractAudio("./videos/video.mp4","./audio/sample.wav");
    const res = await transcribeAudio("./audio/sample.wav");
    await writeFile("./transcribedText/transcript.txt", res ?? "");
    console.log("res:s", res); 

}