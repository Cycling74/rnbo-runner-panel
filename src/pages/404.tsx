import { Button, Flex } from "@mantine/core";
import { IconElement } from "../components/elements/icon";
import { mdiChartSankeyVariant } from "@mdi/js";
import { Link, useLocation } from "react-router";
import { FC } from "react";

export const NotFoundPage: FC<Record<never, never>> = () => {

	const { search } = useLocation();

	return (
		<Flex style={{ height: "100%" }} align="center" justify="center" direction="column" gap="sm">
			<h2>Page not Found</h2>
			<Button
				component={ Link }
				to={{ pathname: "/", search }}
				leftSection={ <IconElement path={ mdiChartSankeyVariant } /> }
				variant="outline"
				color="gray"
			>
				Back to Graph
			</Button>
		</Flex>
	);
};
