import { Alert, Menu, Text } from "@mantine/core";
import { FC, memo } from "react";
import { PatcherExportRecord } from "../../models/patcher";
import { Seq } from "immutable";
import classes from "./patchers.module.css";

type PatcherMenuEntryProps = {
	onLoad: (p: PatcherExportRecord) => void;
	patcher: PatcherExportRecord;
};

const PatcherMenuEntry: FC<PatcherMenuEntryProps> = ({ patcher, onLoad }) => {
	return (
		<Menu.Item onClick={ () => onLoad(patcher) } >
			{ patcher.name }
		</Menu.Item>
	);
};

export type AddPatcherInstanceMenuSectionProps = {
	onLoadPatcherInstance: (p: PatcherExportRecord) => void;
	patchers: Seq.Indexed<PatcherExportRecord>;
};

export const AddPatcherInstanceMenuSection: FC<AddPatcherInstanceMenuSectionProps> = memo(function WrappedAddPatcherSection({
	onLoadPatcherInstance,
	patchers
}) {
	return (
		<div className={ classes.patcherMenuSection } >
			<Menu.Label className={ classes.patcherMenuSectionTitle } >Add Patcher Instance</Menu.Label>
			{
				!patchers.size ? (
					<Alert title="No Patcher available" variant="light" color="yellow">
						<Text size="xs">
							Please export a RNBO patcher to load on the runner.
						</Text>
					</Alert>
				) : null
			}
			<div className={ classes.patcherMenuSectionList } >
				{
					patchers.map(p => <PatcherMenuEntry key={ p.id } patcher={ p } onLoad={ onLoadPatcherInstance } />)
				}
				{
					patchers.map(p => <PatcherMenuEntry key={ p.id + "1" } patcher={ p } onLoad={ onLoadPatcherInstance } />)
				}
				{
					patchers.map(p => <PatcherMenuEntry key={ p.id + "2" } patcher={ p } onLoad={ onLoadPatcherInstance } />)
				}
			</div>
		</div>
	);
});
