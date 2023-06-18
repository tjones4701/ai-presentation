import { getCachedValue, setCachedValue } from "@/server/cache";
import { uuid } from "../utilities/uuid";

export interface IJob<T> {
    id: string;
    static get topic(): string;
    parameters: T;
    running: boolean;
}

const JOBS_REDIS_KEY = "jobs";
export class Job<T> implements IJob<T> {
    id: string;
    topic: string = "job";
    parameters: T
    running: boolean;


    constructor(parameters: T, addToQueue = true) {
        this.id = uuid();
        this.parameters = parameters;
        this.running = false;
        if (addToQueue) {
            this.save();
        }
    }

    static async getJobs(): Promise<Record<string, IJob<any>>> {
        const existingData = await getCachedValue<Record<string, IJob<any>>>(JOBS_REDIS_KEY);
        return existingData ?? {};
    }

    static async getJob<A>(id: string): Promise<IJob<A> | null> {
        return (await this.getJobs())?.[id];
    }

    async save(): Promise<void> {
        const jobs = await Job.getJobs();
        jobs[this.id] = this.serialize();
        await setCachedValue(JOBS_REDIS_KEY, jobs);
    }

    async delete(): Promise<void> {
        const existingData = await getCachedValue<Record<string, Job<any>>>(JOBS_REDIS_KEY);
        if (existingData == null) {
            return;
        }

        if (existingData[this.id]) {
            delete existingData[this.id];
        }
        setCachedValue(JOBS_REDIS_KEY, existingData);
    }
    async run(): Promise<void> {
        this.running = true;
        await this.save();
        try {
            await this.onRun();
        } catch (e) {

        }
        await this.delete();
    }

    log(message: any) {
        console.log("job_" + this.id, message);
    }

    getParameter(key: keyof T): T[keyof T] {
        return this.parameters[key];
    }

    async onRun(): Promise<void> {
        throw new Error("Not Implemented");
    }


    serialize(): IJob<T> {
        return {
            topic: this.topic,
            parameters: this.parameters,
            id: this.id,
            running: this.running
        }
    }
}