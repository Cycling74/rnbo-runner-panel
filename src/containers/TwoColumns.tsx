import styles from "../../styles/TwoColumns.module.css";

export default function TwoColumns({leftContents, rightContents}) {
	return (
		<div className={styles.container}>
			<div className={styles.leftContainer}>
				{leftContents}
			</div>
			<div className={styles.rightContainer}>
				{rightContents}
			</div>
		</div>
	)
}
