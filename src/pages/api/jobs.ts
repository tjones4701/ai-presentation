import { Job } from "@/jobs/jobs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const jobs = await Job.getJobs();
    res.status(200).json(jobs);
}