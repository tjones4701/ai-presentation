import { Job } from "./jobs";
import { GenerateImageJob } from "./generate-image";
import { GenerateIntroductionJob } from "./generate-introduction";
import { GeneratePresentationJob } from "./generate-presentation";
import { GenerateTopicJob } from "./generate-topic";
import { IJob } from "./job-types";
import { GeneratorPresentor } from "./generate-presentor";
import { GenerateSlidesJob } from "./generate-slides";


export const jobsList = [
    GenerateTopicJob,
    GenerateIntroductionJob,
    GenerateImageJob,
    GeneratePresentationJob,
    GeneratorPresentor,
    GenerateSlidesJob
];



export const startJob = async (data: IJob<any>): Promise<boolean> => {
    const JobMap: Record<string, any> = {};
    for (const i in jobsList) {
        const classRef = jobsList[i];
        JobMap[classRef.name] = classRef;
    }

    const topic = data.topic ?? "";
    if (data?.topic == null) {
        console.error("Invalid topic when tryint to start job");
        return false;
    }

    const ClassRef = JobMap[topic];
    if (ClassRef == null) {
        console.error("Job does not exist for " + topic);
        return false;
    }
    const instance: Job<any> = new ClassRef(data.parameters, false);
    instance.id = data.id;
    await instance.run();
    return true;
}