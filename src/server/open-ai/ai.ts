'use server'
import { Configuration, OpenAIApi } from "openai"
export async function createChatCompletion(prompt: string): Promise<string> {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    try {

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: prompt }],
        });

        return completion.data.choices?.[0]?.message?.content ?? "";
    } catch (error) {
        return "";
    }
}