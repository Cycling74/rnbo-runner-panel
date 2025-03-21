import { Title } from "@mantine/core";
import { FC } from "react";
import styles from "./setTitle.module.css";

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
			<Title size="md" my={ 0 } className={ styles.title } >
				{ name }
			</Title>
			{ isDirty ? <span>*</span> : null }
		</div>
	);
};
