import { FC, useCallback } from "react";
import { Button, Group, Menu, Stack, Tooltip } from "@mantine/core";
import { PageTitle } from "../components/page/title";
import { ResourceTabs } from "../components/resources/tabs";
import { useDisclosure } from "@mantine/hooks";
import { mdiFileMusic, mdiPackageUp, mdiUpload } from "@mdi/js";
import { IconElement } from "../components/elements/icon";
import { PackageUploadModal } from "../components/package/uploadModal";
import { DataFileUploadModal, UploadFile } from "../components/datafile/uploadModal";
import { showNotification } from "../actions/notifications";
import { NotificationLevel } from "../models/notification";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getRunnerOrigin } from "../selectors/appStatus";

export const ResourcesPage: FC<Record<never, never>> = () => {

	const dispatch = useAppDispatch();
	const [
		origin
	] = useAppSelector((state: RootStateType) => [
		getRunnerOrigin(state)
	]);

	const [showPackageUploadModal, packageUploadModalHandlers] = useDisclosure(false);
	const [showDataFileUploadModal, dataFileUploadModalHandlers] = useDisclosure(false);

	const onDataFileUploadSuccess = useCallback((files: UploadFile[]) => {
		dispatch(showNotification({ title: "Upload Complete", message: `Successfully uploaded ${files.length === 1 ? files[0].file.name : `${files.length} files`}`, level: NotificationLevel.success }));
		dataFileUploadModalHandlers.close();
	}, [dataFileUploadModalHandlers, dispatch]);

	return (
		<Stack gap="md" h="100%">
			<Group justify="space-between">
				<PageTitle>Manage Resources</PageTitle>
				<Tooltip label="Upload Menu">
					<Menu position="top-end">
						<Menu.Target>
							<Button variant="default" size="xs" leftSection={<IconElement path={mdiUpload} />} >Upload</Button>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Upload</Menu.Label>
							<Menu.Item onClick={ dataFileUploadModalHandlers.open } leftSection={<IconElement path={ mdiFileMusic } /> } >Upload Data Files</Menu.Item>
							<Menu.Item onClick={ packageUploadModalHandlers.open } leftSection={<IconElement path={ mdiPackageUp } /> }>Upload Package</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Tooltip>
			</Group>
			<ResourceTabs />
			{showPackageUploadModal ? <PackageUploadModal onClose={packageUploadModalHandlers.close} /> : null}
			{showDataFileUploadModal ? <DataFileUploadModal origin={origin} maxFileCount={32} onClose={dataFileUploadModalHandlers.close} onUploadSuccess={onDataFileUploadSuccess} /> : null}
		</Stack>
	);
};
