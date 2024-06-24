import { Button, Flex } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconElement } from "../components/elements/icon";
import { mdiChartSankeyVariant } from "@mdi/js";

const NotFound = () => {

	const { query } = useRouter();

	return (
		<Flex style={{ height: "100%" }} align="center" justify="center" direction="column" gap="sm">
			<h2>Page not Found</h2>
			<Button
				component={ Link }
				href={{ pathname: "/", query }}
				leftSection={ <IconElement path={ mdiChartSankeyVariant } /> }
				variant="outline"
				color="gray"
			>
				Back to Graph
			</Button>
		</Flex>
	);
};

export default NotFound;
