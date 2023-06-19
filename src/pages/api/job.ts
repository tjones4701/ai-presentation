import { GeneratePresentationJob } from "@/jobs/generate-presentation";
import { Job } from "@/jobs/jobs";
import { startJob } from "@/jobs/jobs-list";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await GeneratePresentationJob.shouldCreateNewPresentation();

    let hasRan = false;
    const nextJob = await Job.getFirstJobToRun();
    const beforeData = await Job.getJobs();
    if (nextJob != null) {
        hasRan = await startJob(nextJob);
    }

    const afterData = await Job.getJobs();

    res.status(200).json({jobToRun: nextJob, beforeData, afterData});
}