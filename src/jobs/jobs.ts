import { getCachedValue, setCachedValue } from "@/server/cache";
import { uuid } from "../utilities/uuid";
import { IJob } from "./job-types";

const JOBS_REDIS_KEY = "jobs";

export class Job<T> implements IJob<T> {
    id: string;
    parameters: T
    running: boolean;


    constructor(parameters: T, isNew = true) {
        this.parameters = parameters;
        this.running = false;
        console.log("New job created " + this.constructor.name);
        if (isNew) {
            this.id = uuid();
            this.save();
        } else {
            this.id = "";
        }
    }

    static async getJobs(): Promise<Record<string, IJob<any>>> {
        const existingData = await getCachedValue<Record<string, IJob<any>>>(JOBS_REDIS_KEY);
        return existingData ?? {};
    }
    static async clearAll(): Promise<void> {
        await setCachedValue(JOBS_REDIS_KEY, {});
    }

    static async getFirstJobToRun(): Promise<IJob<any> | null> {
        const jobs = await Job.getJobs();
        for(const i in jobs) {
            if (jobs[i].running == false) {
                return jobs[i];
            }
        }
        return null;
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
        if (this.running) {
            return;
        }
        console.log("Running job", this.constructor.name, this.id);
        this.running = true;
        
        await this.save();

        try {
            await this.onRun();
        } catch (e) {
            console.error(e);
        }
        console.log("Job finished", this.constructor.name, this.id);
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
            topic: this.constructor.name,
            parameters: this.parameters,
            id: this.id,
            running: this.running
        }
    }
}