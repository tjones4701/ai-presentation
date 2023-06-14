import { generatePresentation } from "@/server/presentation-generator";

export default async function handler(req, res) {
    let result = null;
    try {
        result = await generatePresentation();
    } catch (e) {
        console.log(e);
    }
    res.status(200).json(result);
}