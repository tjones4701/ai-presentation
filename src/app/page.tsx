import styles from './page.module.css'

export default function Home() {

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <a href='/presentation'>Click here to view the presentation for today.</a>
      </div>
    </main>
  )
}
