import { createChatCompletion, createImage } from "@/server/open-ai/ai";
import { Job } from "./jobs";
import { Conversation } from "@/server/presentation-generator";
import { GeneratePresentationJob } from "./generate-presentation";
import { GenerateSlidesJob } from "./generate-slides";

async function generatePresentor(prompt: string): Promise<Conversation> {
    const conversation: Conversation = {
        chat: [],
        result: ""
    };
    const feelings = [
        "funny",
        "exciting",
        "action packed",
        "random",
        "interesting",
        "boring",
        "inappropriate",
        "uncomfortable",
        "sad",
        "awkward",
        "confusing",
        "scary",
        "weird",
        "unusual",
        "uncomfortable",
        "unusual",
        "mind bending",
        "mind blowing",
    ];
    const backgrounds = [
        "They shouldn't actually know anything about the topic though",
        "They are an expert in the topic",
        "They know a little about the topic",
    ]
    const feeling = feelings[Math.floor(Math.random() * feelings.length)];
    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const chat = `Generate a very short description of someone who would give a ${feeling} presentation on the topic of ${prompt}. ${background} and should mention their job in their description.`;
    conversation.chat.push(chat);
    const response = await createChatCompletion(chat);
    conversation.chat.push(response);
    conversation.result = response;
    return conversation;

}


export class GeneratorPresentor extends Job<{ presentationId: string, topic: string }> {
    static topic = 'generate-presentor';
    async onRun(): Promise<void> {
        const conversation = await generatePresentor(this.getParameter("topic"));
        await GeneratePresentationJob.setPresentor(this.getParameter("presentationId"), conversation);
        new GenerateSlidesJob({
            "presentationId": this.getParameter("presentationId"),
            "presentor": conversation.result,
            "topic": this.getParameter("topic")
        });
    }
}