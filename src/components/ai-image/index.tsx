import { createImage } from "@/server/open-ai/ai";
interface Props {
    children: string;
    className?: string;
}

export const OpenAIImage: React.FC<Props> = async ({ children, className }) => {
    const image = await createImage(children);
    return (
        <img className={className} src={image} />
    );
};