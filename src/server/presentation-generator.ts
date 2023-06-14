import { format } from 'date-fns'
import { createChatCompletion } from "./open-ai/ai";
import { getCachedValue, setCachedValue } from "./cache";

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
    ];
    const feeling = feelings[Math.floor(Math.random() * feelings.length)];
    return await createChatCompletion(`Generate a very short description of someone who would give a ${feeling} presentation on the topic of ${prompt}. They shouldn't actually know anything about the topic though and should mention their job in their description.`);

}

export type Presentation = {
    generating?: boolean;
    topic?: string | null;
    slideOverviews?: Slide[] | null;
}

export function getPresentationKey() {
    const today = Date.now();
    const presentationKey = format(today, "yyyy-MM-dd");
    return presentationKey;
}

export async function getCurrentPresentation(): Promise<Presentation | null> {
    return await getCachedValue<Presentation>(getPresentationKey());
}

export async function generatePresentation(generateNew = false, topic?: string | null) {

    const presentationKey = getPresentationKey();

    let presentation: Presentation = {};

    if (!generateNew) {
        presentation = await getCachedValue<Presentation>(presentationKey) ?? {};
    }

    if (presentation?.generating) {
        return presentation;
    }
    presentation.generating = true;
    await setCachedValue<Presentation>(presentationKey, presentation);
    if (presentation.topic == null) {
        if (topic == null) {
            console.debug("Generating topic");
            presentation.topic = await generateTopic();
        } else {
            presentation.topic = topic;
        }
    }

    if (presentation.slideOverviews == null) {
        console.debug("Generating slides");
        presentation.slideOverviews = await generateSlideOverview(presentation.topic);
    }

    presentation.generating = false;
    await setCachedValue<Presentation>(presentationKey, presentation);

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
    promptParts.push(`I would like you to create a slideshow presentation with 3 to 5 slides based on the following:`);
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
