
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
            messages: [{ role: "system", content: prompt }],
        });

        return completion.data.choices?.[0]?.message?.content ?? "";
    } catch (error) {
        console.log(error);
        return "";
    }
}

export async function createImage(prompt: string): Promise<string> {

    console.debug(`Generating image for ${prompt}`)
    const existingImage = await getCachedValue<string>(prompt);
    if (existingImage != null) {
        console.debug(`Image found in cache`);
        return existingImage;
    }
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

    await setCachedValue(prompt, url);
    return url;
}