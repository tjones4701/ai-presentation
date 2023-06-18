import { createImage } from "@/server/open-ai/ai";
import { Job } from "./jobs";
import { Conversation, Presentation } from "@/server/presentation-generator";
import { getCachedValue, setCachedValue } from "@/server/cache";
import { timings } from "@/utilities/timings";
import { GenerateTopicJob } from "./generate-topic";

const presentationDuration = timings.minute * 30;

export class GeneratePresentationJob extends Job<{ prompt: string }> {
    static topic: string = 'generate-presentation';
    async onRun(): Promise<void> {
        GeneratePresentationJob.startNewPresentation(this.id);
        const generateTopicJob = new GenerateTopicJob({ presentationId: this.id });
        generateTopicJob
    }

    static async savePresentation(presentationId: string, presentation: Presentation): Promise<void> {
        await setCachedValue<Presentation>(`presentation`, presentation);
    }

    static async getPresentation(): Promise<Presentation | null> {
        return await getCachedValue<Presentation>("presentation");
    }

    static async setTopic(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation == null) {
            return;
        }

        presentation.topic = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentationId, presentation);
    }

    static async setSlides(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation == null) {
            return;
        }

        presentation.slideOverviews = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentationId, presentation);
    }

    static async setIntroduction(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation == null) {
            return;
        }

        presentation.introduction = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentationId, presentation);
    }

    static async startNewPresentation(presentationId: string) {

    }

    static async completePresentation(presentationId: string) {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation == null) {
            return;
        }
        const endNow = Date.now();
        presentation.generating = false;
        presentation.createdAt = endNow;
        presentation.expiry = endNow + presentationDuration;
        presentation.creationDuration = endNow - presentation.createdAt;
    }

    static async completePresentation(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation == null) {
            return;
        }

        presentation.introduction = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentationId, presentation);
    }
}