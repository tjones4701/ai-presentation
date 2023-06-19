import { Job } from "@/jobs/jobs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.VERCEL_ENV == "development") {
         await Job.clearAll();    
        res.status(200).json({"message":"Cleared"});
    } else {
        
        res.status(401).json({"message":"Onl available on develop"});
    }
}