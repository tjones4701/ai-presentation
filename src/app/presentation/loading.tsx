import loadingStyles from "./loading.module.scss";

export default function loading() {
    return <div className={loadingStyles.slide}>Creating your artificial presentation, please refresh in 10 seconds.</div>
}