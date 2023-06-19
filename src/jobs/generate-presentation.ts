import { Job } from "./jobs";
import { Conversation, Presentation } from "@/server/presentation-generator";
import { getCachedValue, setCachedValue } from "@/server/cache";
import { timings } from "@/utilities/timings";
import { GenerateTopicJob } from "./generate-topic";

const presentationDuration = timings.minute * 30;

export class GeneratePresentationJob extends Job<{}> {
    static topic: string = 'generate-presentation';
    async onRun(): Promise<void> {
        await GeneratePresentationJob.startNewPresentation(this.id);
        new GenerateTopicJob({ presentationId: this.id });
    }

    static async savePresentation(presentation: Presentation): Promise<void> {
        await setCachedValue<Presentation>(`staging`, presentation);
    }

    static async getPresentation(): Promise<Presentation | null> {
        return await getCachedValue<Presentation>("presentation");
    }
    static async getStagingPresentation(): Promise<Presentation | null> {
        return await getCachedValue<Presentation>("staging");
    }

    static async setTopic(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getStagingPresentation();
        if (presentation?.id != presentationId) {
            throw "Presentation id does not match";
        }

        presentation.topic = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentation);
    }

    static async setSlides(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getStagingPresentation();
        if (presentation?.id != presentationId) {
            throw "Presentation id does not match";
        }

        presentation.slideOverviews = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentation);
    }

    static async setIntroduction(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getStagingPresentation();
        if (presentation?.id != presentationId) {
            throw "Presentation id does not match";
        }

        presentation.introduction = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentation);
    }

    static async setPresentor(presentationId: string, conversation: Conversation<any>): Promise<void> {
        const presentation = await GeneratePresentationJob.getStagingPresentation();
        if (presentation?.id != presentationId) {
            throw "Presentation id does not match";
        }

        presentation.presentor = conversation.result;
        presentation.conversations.push(conversation);
        await GeneratePresentationJob.savePresentation(presentation);
    }

    static async shouldCreateNewPresentation() {
        const presentation = await GeneratePresentationJob.getPresentation();
        const now = Date.now();
        if ((presentation?.expiry ?? 0) < now) {
            const staging = await GeneratePresentationJob.getStagingPresentation();
            if ((staging?.expiry ?? 0) < now) {                
                console.log("Staging expired", staging);
                new GeneratePresentationJob({}, true);                
                return true;
            }
        }
        return false;

    }

    static async startNewPresentation(presentationId: string) {
        const presentation: Presentation = {
            id: presentationId,
            expiry: Date.now() + timings.minute * 5,
            topic: "",
            slideOverviews: [],
            conversations: [],
            introduction: "",
            presentor: "",
            createdAt: Date.now(),
            publishedAt: -1,
        };

        await this.savePresentation(presentation);
    }


    static async publishPresentation(presentationId: string) {
        const presentation = await GeneratePresentationJob.getPresentation();
        if (presentation?.id != presentationId) {
            throw "Presentation id does not match";
        }
        const endNow = Date.now();
        presentation.publishedAt = endNow ;

        await setCachedValue<Presentation>(`presentation`, presentation);
        await setCachedValue<Presentation>(`staging`, {});
        
    }

}