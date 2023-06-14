`use client`
import { Slide, generatePresentation } from "@/server/presentation-generator";
import styles from "./ai-presentation.module.scss";
import { Suspense } from "react";
import { OpenAIImage } from "@/components/ai-image";


const Slide: React.FC<Slide> = (props) => {
    return <div className={styles.slide} style={{ "color": props.textColor, backgroundColor: props.backgroundColor }}>
        <h1>{props.title}</h1>
        <Suspense fallback={<div>Loading</div>}>
            <OpenAIImage className={styles.image}>{props.imageDescription}</OpenAIImage></Suspense>
        <p className={styles.slideBody}>{props.body}</p>
    </div>;
}

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default async function Page(context: { searchParams: Record<string, any> }) {
    let regenerate = false;
    if (process.env.VERCEL_ENV == "development") {
        if (context?.searchParams?.regenerate !== undefined) {
            regenerate = true;
        }
    }

    let presentation = await generatePresentation(regenerate);

    if (presentation == null) {
        return <div>Error creating presentation</div>
    }
    const slides = [];
    for (const i in presentation.slideOverviews) {
        const overview = presentation.slideOverviews[i as any];
        slides.push(<Slide key={overview.title} {...overview} />);
    }
    return <div className={styles.presentation}>{slides}</div>
}

