import { generatePresentation } from "@/server/presentation-generator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let result = null;
    try {
        result = await generatePresentation();
    } catch (e) {
        console.log(e);
    }
    res.status(200).json(result);
}