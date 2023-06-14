import { createImage } from "@/server/open-ai/ai";
import { sleep } from "@/utilities/sleep";
interface Props {
    children: string;
    className?: string;
}


export async function getImage(slide: string): Promise<string> {

    const request = await fetch(`http://localhost:3000/api/images/${slide}`);
    try {
        return (await request?.json())?.src;
    } catch (e) {
        return "";
    }
}

export const OpenAIImage: React.FC<Props> = async ({ children, className }) => {
    const src = await getImage(children);
    if (src == "") {
        return null;
    }
    return (
        <img alt={children} className={className} src={src} />
    );
};