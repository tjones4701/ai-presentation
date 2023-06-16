`use client`
import { Slide, generatePresentation } from "@/server/presentation-generator";
import styles from "./ai-presentation.module.scss";
import { Suspense } from "react";
import { OpenAIImage } from "@/components/server/ai-image";
import { Donate } from "@/components/server/donate";
import Loading from "./loading";
import PageRefresher from "@/components/client/page-refresher";
import { JsonViewer } from "@/components/server/json-viewer";

export type SlideProps = Slide & { noImages: boolean }
const SlideElement: React.FC<SlideProps> = (props) => {
    return <div className={styles.slide} style={{ "color": props.textColor, backgroundColor: props.backgroundColor }}>
        <h1 className={styles.title}>{props.title}</h1>
        {!props?.noImages && props.imageDescription != null && <Suspense fallback={<div>Loading</div>}>
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
    if (presentation.generating && presentation.old == null) {
        return <><Loading /><PageRefresher refreshInterval={10} /></>
    }

    if (context?.searchParams?.debug !== undefined) {
        return <div className={styles.debug}>
            <h1>
                Debug View
            </h1>
            <h2>Conversation Data</h2><p>Below are the conversations used to chat gpt. The result field is the field we extracted from the conversation.</p>
            <JsonViewer expanded>{presentation?.conversations}</JsonViewer>
            <h2>Full Data</h2><p>Below is the full data used to generate the slideshow.</p>
            <JsonViewer expanded>{presentation?.conversations}</JsonViewer>
        </div>
    }
    const slides = [];

    let slidesOverviews = presentation.slideOverviews;
    if (presentation.generating) {
        slidesOverviews = presentation.old;
    }
    if (presentation.introduction != null) {
        slides.push(<div className={styles.introduction}>{presentation.introduction}</div>);
    }
    for (const i in slidesOverviews) {
        const overview = slidesOverviews[i as any];
        slides.push(<SlideElement noImages={noImages} key={overview.title} {...overview} />);
    }
    if (slides.length == 0) {
        return <div>
            No slides found.
        </div>
    }
    return <div className={styles.presentation}>
        {presentation.generating && <div><hr />Hold onto your shoes, we are creating a new presentation.<br /><i><small>This can take up to 2 minutes</small></i><hr /></div>}
        {slides}
        <Donate />
    </div>
}

