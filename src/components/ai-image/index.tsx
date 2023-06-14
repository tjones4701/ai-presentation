import { createImage } from "@/server/open-ai/ai";
interface Props {
    children: string;
    className?: string;
}

export const OpenAIImage: React.FC<Props> = async ({ children, className }) => {
    const src = await createImage(children);
    return (
        <img alt={children} className={className} src={src} />
    );
};