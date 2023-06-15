
import styles from "./donate.module.scss";
const donationLink = "https://buy.stripe.com/fZe9DP5wG4An9O08ww";

export type DonateProps = {
    transparentBackground?: boolean;
    children?: any;
}
export const Donate: React.FC<DonateProps> = ({ transparentBackground, children }) => {
    let className = styles.donateContainer;

    if (transparentBackground !== true) {
        className = `${className} ${styles.backgroundColour}`
    }
    return (
        <div className={className}>
            <div className={styles.donate}>
                We are supported by amazing people like you.
                <br />If you like our work, please consider donating using the link below.
                <br />
                <a className={styles.donateButton} href={donationLink} target="_blank" rel="noreferrer">Support us</a>
                <br />
                <br />
                {children}
            </div>
        </div>
    );
}