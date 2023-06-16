import { format } from 'date-fns'
import { createChatCompletion } from "./open-ai/ai";
import { getCachedValue, setCachedValue } from "./cache";
import { timings } from '@/utilities/timings';
import { start } from 'repl';

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
    creationDuration?: number;
    old?: any;
    createdAt?: number;
    expiry?: number;
    generating?: boolean;
    topic?: string | null;
    slideOverviews?: Slide[] | null;
    conversations: Conversation<any>[];
    introduction?: string;
}

export async function getCurrentPresentation(): Promise<Presentation | null> {
    return await getCachedValue<Presentation>("presentation");
}

let isGenerating = false;
const presentationDuration = timings.minute * 30;

export async function generatePresentation(generateNew = false, topic?: string | null) {

    const startNow = Date.now();

    let presentation: Presentation = {conversations: [], createdAt: startNow};

    // If we are currently generating a presentation then just return it.
    presentation = await getCachedValue<Presentation>("presentation") ?? {
        conversations: [],
    };
    if (presentation?.generating || isGenerating) {
        const timeout = (presentation?.createdAt ?? 0) + (timings.minute * 5);
        if (timeout < startNow) {
            generateNew = true;
            console.debug("Presentation Generation Expired");
        } else {            
            return presentation ?? { generating: true };
        }
    }



    if ((presentation?.expiry ?? 0) < startNow) {
        console.debug("Presentation Expired");
        generateNew = true;
    }

    if (!generateNew) {
        console.debug("Returning existing presentation");
        return presentation;
    }
    presentation.old = presentation?.slideOverviews;
    console.debug("Creating new presentation");

    presentation.conversations = [];

    presentation.generating = true;
    presentation.createdAt = startNow;
    await setCachedValue<Presentation>("presentation", presentation);

    if (topic == null) {
        console.debug("Generating topic");
        const topicConversation = await generateTopic();
        presentation.conversations.push(topicConversation);
        presentation.topic = topicConversation.result;
    } else {
        presentation.topic = topic;
    }

    const presentor = await generatePresentor(presentation.topic);
    presentation.conversations?.push(presentor);

    console.debug("Generating slides");
    const slideOverviewsConversation = await generateSlideOverview(presentation.topic,presentor.result);
    if (slideOverviewsConversation != null) {
        presentation.conversations.push(slideOverviewsConversation);
        presentation.slideOverviews =slideOverviewsConversation.result;
    }

    
    console.debug("Generating introduction");
    const intro = await presentationOverview(JSON.stringify({
        "presentor": presentor?.result,
        "slides": presentation.slideOverviews
    }));
    if (intro != null) {
        presentation.conversations.push(intro);
        presentation.introduction = intro?.result;
    }

    const endNow = Date.now();
    presentation.generating = false;
    presentation.createdAt = endNow;
    presentation.expiry = endNow + presentationDuration;
    presentation.creationDuration = endNow - startNow;

    
    console.debug(`Presentation created in ${presentation.creationDuration}`);
    const existingPresentation = await getCachedValue<Presentation>("presentation");
    if (existingPresentation?.createdAt != startNow) {
        return existingPresentation;
    }
    await setCachedValue<Presentation>("presentation", presentation);

    return presentation;
}

export type Slide = {
    title?: string;
    body: string;
    imageDescription?: string;
    imageSrc?: string;
    backgroundColor?: string;
    textColor?: string;
}

async function presentationOverview(prompt:string): Promise<Conversation | null> {
    const conversation: Conversation = {
        chat: [],
        result: ""
    }
    const promptParts: string[] = [`Acting as a presentation facilatator, please create a short introduction to the below presentation data.`];    
    promptParts.push(prompt);
    promptParts.push("After the introduction include a call to action to get people to donate using the link at the bottom of the page. This call to action should try to be relevant/related to the content of the presentation but isn't a donation for the presentation. It is instead a donation for a project that uses AI to generate the presentation.");
    const promptJoined = promptParts.join("\n");
    conversation.chat.push(promptJoined);
    try {
        const result = await createChatCompletion(promptJoined);
        conversation.chat.push(result);
        conversation.result = result;

        return conversation;
    } catch (e) {
        console.error(e);
        return null;
    }
}
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
