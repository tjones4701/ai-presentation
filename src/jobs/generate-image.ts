import { createImage } from "@/server/open-ai/ai";
import { Job } from "./jobs";

export class GenerateImageJob extends Job<{ prompt: string }> {
    async onRun(): Promise<void> {
        createImage(this.getParameter("prompt"));
    }
}