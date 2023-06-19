import { createChatCompletion, createImage } from "@/server/open-ai/ai";
import { Job } from "./jobs";
import { Conversation, Slide } from "@/server/presentation-generator";
import { GeneratePresentationJob } from "./generate-presentation";
import {  GenerateIntroductionJob } from "./generate-introduction";


async function generateSlideOverview(prompt: string, presentor: string): Promise<Conversation<Slide[]> | null> {

    const conversation: Conversation<Slide[]> = {
        chat: [],
        result: []
    }
    const exampleSlide: Slide[] = [{
        "title": "{title}",
        "body": "{body}",
        "imageDescription": "{image}",
        backgroundColor: "{backgroundColor}",
        textColor: "{textColor}"
    }];

    const promptParts = [];
    promptParts.push(`I would like you to create a slideshow presentation with 3 to 7 slides based on the following:`);
    promptParts.push(prompt);
    promptParts.push("Please generate this in a json structure matching the following:");
    promptParts.push(JSON.stringify(exampleSlide));


    promptParts.push("Other important things to note:");
    promptParts.push("In the image description field please create a descriptive image that will go along with the slide");

    promptParts.push(`Write the presentation body and title if presented by someone who matches this description: ${presentor}`);
    promptParts.push("When writing the body always try to include references to the persona and how it relates to their life.");
    const promptJoined = promptParts.join("\n");
    conversation.chat.push(promptJoined);

    try {
        const result = await createChatCompletion(promptJoined);
        conversation.chat.push(result);
        try {
            const slides: Slide[] = JSON.parse(result);
            conversation.result = slides;
            return conversation;
        } catch (e) {
            console.error("ERROR", result);
        }

        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}



export class GenerateSlidesJob extends Job<{ presentationId: string, topic: string, presentor: string }> {
    topic = 'generate-slides';
    async onRun(): Promise<void> {
        const presentationId = this.getParameter("presentationId");
        const conversation = await generateSlideOverview(this.getParameter("topic"), this.getParameter("presentor"));
        if (conversation == null) {
            return;
        }

        await GeneratePresentationJob.setSlides(presentationId, conversation);
        new GenerateIntroductionJob({presentationId: presentationId, slides: conversation.result, presentor: this.getParameter("presentor")})
    }
}