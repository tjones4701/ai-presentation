import LoadingBar from "@/components/client/loading-bar";
import loadingStyles from "./loading.module.scss";
import { Donate } from "@/components/server/donate";

export default function loading() {
    return <div className={loadingStyles.slide}>
        Creating artificial presentation, please wait
        <br />
        <br />
        <LoadingBar isLoading={true} />
        <br />
        <Donate />
    </div>
}