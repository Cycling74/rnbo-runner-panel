import { FunctionComponent, MouseEvent, memo, useCallback } from "react";
import { Button, Group } from "@mantine/core";
import { PatcherRecord } from "../../models/patcher";

export type PatcherItemProps = {
	patcher: PatcherRecord;
	onLoad: (set: PatcherRecord) => any;
};

export const PatcherItem: FunctionComponent<PatcherItemProps> = memo(function WrappedPatcherItem({
	patcher,
	onLoad
}: PatcherItemProps) {

	const onLoadPatcher = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(patcher);
	}, [onLoad, patcher]);

	return (
		<Group gap="xs">
			<Button
				fullWidth
				justify="flex-start"
				size="sm"
				variant="default"
				onClick={ onLoadPatcher }
			>
				{ patcher.name }
			</Button>
		</Group>
	);
});
