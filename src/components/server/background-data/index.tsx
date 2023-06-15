
import styles from "./donate.module.scss";
const donationLink = "https://buy.stripe.com/fZe9DP5wG4An9O08ww";

export type DonateProps = {
    transparentBackground?: boolean;
}
export const Donate: React.FC<DonateProps> = ({ transparentBackground }) => {
    let className = styles.donateContainer;

    if (transparentBackground !== true) {
        className = `${className} ${styles.backgroundColour}`
    }
    console.log(className);
    return (
        <div className={className}>
            <div className={styles.donate}>
                We are supported by amazing people like you.
                <br />If you like our work, please consider donating to us using the link below.
                <br />
                <a className={styles.donateButton} href={donationLink} target="_blank" rel="noreferrer">Support us</a>
            </div>
        </div>
    );
}