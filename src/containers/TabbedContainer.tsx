import styles from "../../styles/TabbedContainer.module.css";

import { FunctionComponent, ReactNode, useMemo, useState } from "react";


interface TabbedContainerProps {
	firstTabContents: ReactNode;
	secondTabContents: ReactNode;
}

const TabbedContainer: FunctionComponent<TabbedContainerProps> = ({ firstTabContents, secondTabContents }) => {
	const [tabIndex, setTabIndex] = useState(0);

	const container = useMemo(() => (tabIndex === 0 ? firstTabContents : secondTabContents), [tabIndex, firstTabContents, secondTabContents]);

	return <div className={styles.tabWrapper}>
		<div className={styles.tabDisplay}>
			{container}
		</div>
		<div className={styles.tabs}>
			<div className={styles.tab + (tabIndex === 0 ? ` ${styles.selected}` : "")} onPointerDown={() => setTabIndex(0)}>Parameters</div>
			<div className={styles.tab + (tabIndex === 1 ? ` ${styles.selected}` : "")} onPointerDown={() => setTabIndex(1)}>Inputs</div>
		</div>
	</div>
}

export default TabbedContainer;
