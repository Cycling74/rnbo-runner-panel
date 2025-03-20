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
		<Title size="md" my={ 0 } className={ styles.title } data-is-dirty={ isDirty } >
			{ name }
		</Title>
	);
};
