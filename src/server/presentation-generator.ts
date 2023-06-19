import { createChatCompletion } from "./open-ai/ai";
import { getCachedValue, setCachedValue } from "./cache";
export type Conversation<T = string> = {
    chat: string[],
    result: T;
}
async function generateTopic(tryNumber = 0): Promise<Conversation> {
    const result:Conversation = {
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

export type Presentation = {
    id: string;
    createdAt: number;
    publishedAt: number;
    expiry: number;
    topic: string | null;
    slideOverviews: Slide[] | null;
    conversations: Conversation<any>[];
    introduction: string;
    presentor: string;
}

export async function getCurrentPresentation(): Promise<Presentation | null> {
    return await getCachedValue<Presentation>("presentation");
}

export type Slide = {
    title?: string;
    body: string;
    imageDescription?: string;
    imageSrc?: string;
    backgroundColor?: string;
    textColor?: string;
}
