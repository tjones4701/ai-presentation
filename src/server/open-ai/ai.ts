
'use server'
import { Configuration, OpenAIApi } from "openai-edge"
import { getCachedValue, setCachedValue } from "../cache";
import { quickHash } from "@/utilities/quick-hash";
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

        return (await completion.json()).choices?.[0]?.message?.content ?? "";
    } catch (error) {
        console.log(error);
        return "";
    }
}

export type ImageStore = {
    generating?: boolean;
    url?: string;
    error?: boolean;
}

const imagesBeingGenerated: Record<string, boolean> = {};
const images: Record<string, ImageStore> = {};

export async function createImage(prompt: string): Promise<ImageStore> {
    const index = `image_${quickHash(prompt)}`;

    if (imagesBeingGenerated[index]) {
        return { generating: true };
    }

    if (images?.[index] != null) {
        return images[index];
    }

    const existingImage: ImageStore = await getCachedValue<ImageStore>(index) ?? {};
    if (existingImage?.generating) {
        return existingImage;
    }
    if (existingImage?.url) {
        return existingImage;
    }
    try {
        imagesBeingGenerated[index] = true;
        console.debug(`Generating image for ${prompt}`)
        existingImage.generating = true;
        await setCachedValue(index, existingImage);

        console.debug(`New image being generated`);

        const configuration = new Configuration({
            apiKey: process.env.OPEN_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "512x512",
        });

        const json = await response?.json();
        const url = json?.data?.[0]?.url;

        existingImage.generating = false;
        existingImage.url = url;
        imagesBeingGenerated[index] = false;
        images[index] = existingImage;
        await setCachedValue(index, existingImage);
        return existingImage;
    } catch (e) {
        images[index] = { generating: false, url: "https://picsum.photos/536/354", error: true };
        imagesBeingGenerated[index] = false;
        await setCachedValue(index, images[index]);
        return images[index];
    }
}