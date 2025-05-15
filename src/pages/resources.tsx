import { ActionIcon, Group, Stack, Tooltip } from "@mantine/core";
import { PageTitle } from "../components/page/title";
import { ResourceTabs } from "../components/resources/tabs";
import { useDisclosure } from "@mantine/hooks";
import { mdiPackageUp } from "@mdi/js";
import { IconElement } from "../components/elements/icon";
import { PackageUploadModal } from "../components/package/uploadModal";

const Resources = () => {
	const [showUploadModal, uploadModalHandlers] = useDisclosure(false);

	return (
		<Stack gap="md" h="100%">
			<Group justify="space-between">
				<PageTitle>Manage Resources</PageTitle>
				<Tooltip label="Upload Package">
					<ActionIcon variant="default" onClick={ uploadModalHandlers.open } >
						<IconElement path={ mdiPackageUp } />
					</ActionIcon>
				</Tooltip>
			</Group>
			{ showUploadModal ? <PackageUploadModal onClose={ uploadModalHandlers.close } /> : null }
			<ResourceTabs />
		</Stack>
	);
};

export default Resources;
