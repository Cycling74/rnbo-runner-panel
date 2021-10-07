import { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/TwoColumns.module.css";

interface TwoColumnsProps {
	leftContents: ReactNode;
	rightContents: ReactNode;
}

const TwoColumns: FunctionComponent<TwoColumnsProps> = ({leftContents, rightContents}) => {
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

export default TwoColumns;
