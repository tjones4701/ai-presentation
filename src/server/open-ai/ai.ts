
'use server'
import { Configuration, OpenAIApi } from "openai"
import { getCachedValue, setCachedValue } from "../cache";
export async function createChatCompletion(prompt: string): Promise<string> {
    const configuration = new Configuration({
        apiKey: process.env.OPEN_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    try {

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "assistant", content: prompt }],
        });

        return completion.data.choices?.[0]?.message?.content ?? "";
    } catch (error) {
        console.log(error);
        return "";
    }
}

export type ImageStore = {
    generating?: boolean;
    url?: string;
}

export async function createImage(prompt: string): Promise<ImageStore> {


    const existingImage: ImageStore = await getCachedValue<ImageStore>(prompt) ?? {};
    if (existingImage?.generating) {
        return existingImage;
    }
    if (existingImage?.url) {
        return existingImage;
    }
    console.debug(`Generating image for ${prompt}`)
    existingImage.generating = true;
    await setCachedValue(prompt, existingImage);

    console.debug(`New image being generated`);

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

    const url = response?.data?.data?.[0]?.url;

    existingImage.generating = false;
    existingImage.url = url;
    await setCachedValue(prompt, existingImage);
    return existingImage;
}