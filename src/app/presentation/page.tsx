import { Slide, generateImage, generatePresentation } from "@/server/presentation-generator";
import styles from "./page.module.scss";

export type Presentation = {
  topic: string;
  outcome: string;
  presentor: string;
  themes: string[];
}


const SlideImage: React.FC<{ children: string }> = ({ children }) => {
  if (children == null || children == "") {
    return <></>
  }
  return <img className={styles.image} src={children} />
};

const Slide: React.FC<Slide> = (props) => {
  return <div className={styles.slide} style={{ "color": props.textColor, backgroundColor: props.backgroundColor }}>
    <h1>{props.title}</h1>
    <SlideImage>{props.imageSrc ?? ""}</SlideImage>
    <p className={styles.slideBody}>{props.body}</p>
  </div>;
}
// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default async function Page() {
  const presentation = await generatePresentation();
  const data = await generateImage("Poodle in a blue suit");
  const slides = [];
  for (const i in presentation.slideOverviews) {
    const overview = presentation.slideOverviews[i as any];
    slides.push(<Slide key={overview.title} {...overview} />);
  }
  return <div className={styles.presentation}>{slides}</div>
}

