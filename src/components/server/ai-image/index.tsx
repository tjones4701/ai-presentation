import { createImage } from "@/server/open-ai/ai";
import styles from "./ai-image.module.scss";
interface Props {
    children: string;
    className?: string;
}

export const OpenAIImage: React.FC<Props> = async ({ children, className }) => {
    const src = await createImage(children);
    if (src.generating) {
        return <span>Generating image.....</span>;
    }
    return (
        <img alt={children} className={`${styles?.image} ${className}`} src={src.url} />
    );
};