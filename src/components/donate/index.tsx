
import styles from "./donate.module.scss";
const donationLink = "https://buy.stripe.com/fZe9DP5wG4An9O08ww";


export const Donate: React.FC = () => {
    return (
        <div className={styles.donateContainer}>
            <div className={styles.donate}>
                We are supported by amazing people like you.
                <br />If you like our work, please consider donating to us using the link below.
                <br />
                <a className={styles.donateButton} href={donationLink} target="_blank" rel="noreferrer">Support us</a>
            </div>
        </div>
    );
}