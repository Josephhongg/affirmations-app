"use client";
import styles from "./Header.module.css";

export default function Header() {
	return (
		<header className={styles.header}>
			<img
				src="/logo.svg"
				alt="The Art of Optimism logo"
				className={styles.logo}
			/>
			<h1 className={styles.title}>The Art of Optimism</h1>
		</header>
	);
}
