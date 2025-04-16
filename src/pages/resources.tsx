import { Stack } from "@mantine/core";
import { PageTitle } from "../components/page/title";
import { ResourceTabs } from "../components/resources/tabs";

const Resources = () => {

	return (
		<Stack gap="md" h="100%">
			<PageTitle>Manage Resources</PageTitle>
			<ResourceTabs />
		</Stack>
	);
};

export default Resources;
