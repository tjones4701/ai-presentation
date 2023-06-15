import { format } from 'date-fns'
import { createChatCompletion } from "./open-ai/ai";
import { getCachedValue, setCachedValue } from "./cache";
import { timings } from '@/utilities/timings';

async function generateTopic(tryNumber = 0): Promise<string> {
    if (tryNumber > 10) {
        console.error("")
    }
    const exampleFormat = [{
        "summary": "{summary}"
    }];
    const randomYear = 2020 - Math.floor(Math.random() * 100);
    const promptParts: string[] = [`Generate a json data structure in the format of:`];
    promptParts.push(JSON.stringify(exampleFormat));
    promptParts.push(`This json data structure should contain interesting topics related to the year ${randomYear} for a presentor to talk about.`);

    const parts = await createChatCompletion(promptParts.join("\n"));
    try {
        const data = JSON.parse(parts);
        const randomRecord = data[Math.floor(Math.random() * data.length)];
        return randomRecord?.summary;
    } catch (e) {
        return await generateTopic(tryNumber + 1);
    }
}


async function generatePresentor(prompt: string): Promise<string> {
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
    return await createChatCompletion(`Generate a very short description of someone who would give a ${feeling} presentation on the topic of ${prompt}. ${background} and should mention their job in their description.`);

}

export type Presentation = {
    creationDuration?: number;
    createdAt?: number;
    expiry?: number;
    generating?: boolean;
    topic?: string | null;
    slideOverviews?: Slide[] | null;
}

export async function getCurrentPresentation(): Promise<Presentation | null> {
    return await getCachedValue<Presentation>("presentation");
}

let isGenerating = false;
const presentationDuration = timings.minute * 30;

export async function generatePresentation(generateNew = false, topic?: string | null) {

    const startNow = Date.now();

    let presentation: Presentation = {};

    // If we are currently generating a presentation then just return it.
    presentation = await getCachedValue<Presentation>("presentation") ?? {};
    if (presentation?.generating || isGenerating) {
        console.debug("Already generating presentation");
        return presentation ?? { generating: true };
    }


    if ((presentation?.expiry ?? 0) < startNow) {
        console.debug("Presentation Expired");
        generateNew = true;
    }

    if (!generateNew) {
        console.debug("Returning existing presentation");
        return presentation;
    }
    console.debug("Creating new presentation");

    presentation.generating = true;
    await setCachedValue<Presentation>("presentation", presentation);

    if (topic == null) {
        console.debug("Generating topic");
        presentation.topic = await generateTopic();
    } else {
        presentation.topic = topic;
    }

    console.debug("Generating slides");
    presentation.slideOverviews = await generateSlideOverview(presentation.topic);

    const endNow = Date.now();
    presentation.generating = false;
    presentation.createdAt = endNow;
    presentation.expiry = endNow + presentationDuration;
    presentation.creationDuration = endNow - startNow;
    console.debug(`Presentation created in ${presentation.creationDuration}`);
    await setCachedValue<Presentation>("presentation", presentation);

    return presentation;
}

export type Slide = {
    title: string;
    body: string;
    imageDescription: string;
    imageSrc?: string;
    backgroundColor: string;
    textColor: string;
}
async function generateSlideOverview(prompt: string): Promise<Slide[]> {

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
    const presentor = await generatePresentor(prompt);
    promptParts.push(`Write the presentation body and title if presented by someone who matches this description: ${presentor}`);
    promptParts.push("When writing the body always try to include references to the persona and how it relates to their life.");

    try {
        const result = await createChatCompletion(promptParts.join("\n"));
        try {
            const slides: Slide[] = JSON.parse(result);
            return slides;
        } catch (e) {
            console.error("ERROR", result);
        }

        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
