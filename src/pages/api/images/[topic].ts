import { createImage } from "@/server/open-ai/ai";
import { getCurrentPresentation } from "@/server/presentation-generator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const topic = req?.query?.topic;

    const presentation = await getCurrentPresentation();
    const slide = presentation?.slideOverviews?.find((item) => {
        return item.imageDescription == topic;
    });
    let imageSrc = "";
    try {
        imageSrc = await createImage(slide?.imageDescription ?? "");
    } catch (e) {
        console.log(e);
    }
    res.status(200).json({ "src": imageSrc });
}