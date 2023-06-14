`use client`
import { Slide, generatePresentation } from "@/server/presentation-generator";
import styles from "./ai-presentation.module.scss";
import { Suspense } from "react";
import { OpenAIImage } from "@/components/ai-image";

export type SlideProps = Slide & { noImages: boolean }
const SlideElement: React.FC<SlideProps> = (props) => {
    return <div className={styles.slide} style={{ "color": props.textColor, backgroundColor: props.backgroundColor }}>
        <h1 className={styles.title}>{props.title}</h1>
        {!props?.noImages && <Suspense fallback={<div>Loading</div>}>
            <OpenAIImage className={styles.image}>{props.imageDescription}</OpenAIImage>
        </Suspense>
        }
        <p className={styles.slideBody}>{props.body}</p>
    </div>;
}

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default async function Page(context: { searchParams: Record<string, any> }) {
    let regenerate = false;
    let noImages = false;
    let topic: string | null = null;
    if (process.env.VERCEL_ENV == "development") {
        if (context?.searchParams?.regenerate !== undefined) {
            regenerate = true;
        }
        if (context?.searchParams?.noImages !== undefined) {
            noImages = true;
        }

        topic = context?.searchParams?.topic;
    }

    let presentation = await generatePresentation(regenerate, topic);

    if (presentation == null) {
        return <div>Error creating presentation</div>
    }
    const slides = [];
    for (const i in presentation.slideOverviews) {
        const overview = presentation.slideOverviews[i as any];
        slides.push(<SlideElement noImages={noImages} key={overview.title} {...overview} />);
    }
    if (slides.length == 0) {
        return <div>
            No slides found.
        </div>
    }
    return <div className={styles.presentation}>{slides}</div>
}

