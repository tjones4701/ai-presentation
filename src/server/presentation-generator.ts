import { format } from 'date-fns'
import { createChatCompletion } from "./open-ai/ai";
import { getCachedValue, setCachedValue } from "./cache";

export async function generateTopic(tryNumber = 0): Promise<string> {
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

export type Presentation = {
    topic?: string | null;
    slideOverviews?: Slide[] | null;
}

export async function generatePresentation(generateNew = false) {
    console.debug("Generating new presentation");
    const today = Date.now();
    const presentationKey = format(today, "yyyy-MM-dd");

    let presentation: Presentation | null = {};

    if (!generateNew) {
        presentation = await getCachedValue<Presentation>(presentationKey);
    }
    if (presentation == null) {
        presentation = {};
    }

    if (presentation.topic == null) {
        console.debug("Generating topic");
        presentation.topic = await generateTopic();
    } else {
        console.debug("Topic already generated");
    }

    if (presentation.slideOverviews == null) {
        console.debug("Generating slides");
        presentation.slideOverviews = await generateSlideOverview(presentation.topic);
    } else {
        console.debug("Slides already generated");
    }


    console.debug("Presentation generated-saving");

    await setCachedValue<Presentation>(presentationKey, presentation);
    console.debug("Presentation generation complete");

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
export async function generateSlideOverview(prompt: string): Promise<Slide[]> {

    const exampleSlide: Slide[] = [{
        "title": "{title}",
        "body": "{body}",
        "imageDescription": "{image}",
        backgroundColor: "{backgroundColor}",
        textColor: "{textColor}"
    }];

    const promptParts = [`I would like you to create a slideshow presentation with 3 to 5 slides based on the following:`];
    promptParts.push(prompt);
    promptParts.push("Please generate this in a json structure matching the following:");
    promptParts.push("In the image description field please create a descriptive image that will go along with the slide");
    promptParts.push(JSON.stringify(exampleSlide));

    try {
        console.debug("Asking for completion for slides");
        const result = await createChatCompletion(promptParts.join("\n"));
        console.debug("Completion done");
        try {
            const slides: Slide[] = JSON.parse(result);
            return slides;
        } catch (e) {
            console.error(e);
        }

        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function generateImage(prompt: string) {
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
        apiKey: process.env.OPEN_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "512x512",
    });

    return response?.data?.data?.[0]?.url;
}

export async function generateSlide(prompt: string) {
    const exampleSlide = {
        "title": "{title}",
        "body": "{body}",
        "image": "{image}"
    }
    const promptParts: string[] = [`I would like you to generate a json data structure for a slide. The json data structure should be as follows:`];
    promptParts.push(JSON.stringify(exampleSlide));
    promptParts.push('This slide should be about the following:');
    promptParts.push(prompt);

    const promptJoined = promptParts.join("\n");
    const data = await createChatCompletion(promptJoined);

    return data;

}