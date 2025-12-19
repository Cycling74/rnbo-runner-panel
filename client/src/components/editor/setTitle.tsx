import { FC } from "react";
import styles from "./setTitle.module.css";
import { PageTitle } from "../page/title";

export type GraphSetTitleProps = {
	isDirty: boolean;
	name: string;
}

export const GraphSetTitle: FC<GraphSetTitleProps> = ({
	isDirty,
	name
}) => {
	return (
		<div className={ styles.wrap } >
			<PageTitle className={ styles.title } >
				{ name }
			</PageTitle>
			{ isDirty ? <span>*</span> : null }
		</div>
	);
};
