import { Presentation, Slide, generatePresentation } from "@/server/presentation-generator";
import styles from "./page.module.scss";
import { Suspense } from "react";
import { OpenAIImage } from "@/components/ai-image";


export const revalidate = 1 // revalidate every second


const Slide: React.FC<Slide> = (props) => {
  return <div className={styles.slide} style={{ "color": props.textColor, backgroundColor: props.backgroundColor }}>
    <h1>{props.title}</h1>
    <Suspense fallback={<div>Loading</div>}>
      <OpenAIImage className={styles.image}>{props.imageDescription}</OpenAIImage></Suspense>
    <p className={styles.slideBody}>{props.body}</p>
  </div>;
}

export async function getPresentation(): Promise<Presentation | null> {
  try {
    const request = await fetch("http://localhost:3000/api/presentation");
    return (await request?.json());
  } catch (e) {
    return null;
  }
}

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default async function Page() {
  const presentation = await getPresentation();
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

