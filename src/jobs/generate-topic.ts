import { createChatCompletion, createImage } from "@/server/open-ai/ai";
import { Job } from "./jobs";
import { Conversation } from "@/server/presentation-generator";
import { GeneratorPresentor } from "./generate-presentor";
import { GeneratePresentationJob } from "./generate-presentation";

async function generateTopic(tryNumber = 0): Promise<Conversation> {
    const result: Conversation = {
        chat: [],
        result: ""
    };
    if (tryNumber > 10) {
        console.error("")
    }
    const exampleFormat = [{
        "topic": "{topic}"
    }];
    const randomYear = 2020 - Math.floor(Math.random() * 100);
    const promptParts: string[] = [`Using the json format below:`];
    promptParts.push(JSON.stringify(exampleFormat));
    promptParts.push(`Create a list of interesting topics related to the year ${randomYear} for a presentor to talk about. Please reply with only the json data.`);

    const prompt = promptParts.join("\n");
    result.chat.push(prompt);
    const parts = await createChatCompletion(prompt);
    result.chat.push(parts);
    try {
        const data = JSON.parse(parts);
        const randomRecord = data[Math.floor(Math.random() * data.length)];
        result.result = randomRecord?.topic;
        return result;
    } catch (e) {
        return await generateTopic(tryNumber + 1);
    }
}


export class GenerateTopicJob extends Job<{ presentationId: string }> {
    async onRun(): Promise<void> {
        const presentationId = this.getParameter("presentationId");
        const topic = await generateTopic();
        await GeneratePresentationJob.setTopic(presentationId,topic);
        new GeneratorPresentor({ presentationId: presentationId, topic: topic.result });
    }
}