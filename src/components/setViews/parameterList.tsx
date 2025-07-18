import { Map as ImmuMap, OrderedSet as ImmuOrderedSet } from "immutable";
import { ComponentType, FC, memo } from "react";
import ParameterList, { ParameterListProps } from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import ParameterItem from "../parameter/item";
import { ParameterSetViewActionsProps, withParameterSetViewActions } from "../parameter/withSetViewActions";
import { ParameterMIDIActionsProps, withParameterMIDIActions } from "../parameter/withMidiActions";
import { AppSettingRecord } from "../../models/settings";
import { PatcherInstanceRecord } from "../../models/instance";
import { ParameterWithInstanceNamePrefixProps, withPatcherInstanceNamePrefix } from "../parameter/withInstanceNamePrefix";

const ParameterComponentType = withPatcherInstanceNamePrefix(withParameterMIDIActions(withParameterSetViewActions(ParameterItem)));
const ParameterListComponent: ComponentType<ParameterListProps<ParameterSetViewActionsProps & ParameterMIDIActionsProps & ParameterWithInstanceNamePrefixProps>> = ParameterList;

export type SetViewParameterListProps = {
	patcherInstances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	parameters: ImmuOrderedSet<ParameterRecord>;
	thumbSize: AppSettingRecord;
	trackSize: AppSettingRecord;
	waitingForMidiMapping: boolean;
	onClearParamMIDIMapping: (param: ParameterRecord) => void;
	onActivateParamMIDIMapping: (param: ParameterRecord) => void;
	onRestoreParamMetadata: (param: ParameterRecord) => void;
	onSaveParamMetadata: (param: ParameterRecord, meta: string) => void;
	onDecreaseParamIndex: (param: ParameterRecord) => void;
	onIncreaseParamIndex: (param: ParameterRecord) => void;
	onRemoveParamFromSetView: (param: ParameterRecord) => void;
	onSetNormalizedParamValue: (param: ParameterRecord, value: number) => void;
}

export const SetViewParameterList: FC<SetViewParameterListProps> = memo(function WrappedSetViewParameterList({
	parameters,
	thumbSize,
	trackSize,
	patcherInstances,
	waitingForMidiMapping,
	onActivateParamMIDIMapping,
	onClearParamMIDIMapping,
	onRestoreParamMetadata,
	onSaveParamMetadata,
	onDecreaseParamIndex,
	onIncreaseParamIndex,
	onRemoveParamFromSetView,
	onSetNormalizedParamValue
}) {

	return (
		<div className={ "" } >
			<ParameterListComponent
				onRestoreMetadata={ onRestoreParamMetadata }
				onSaveMetadata={ onSaveParamMetadata }
				onSetNormalizedValue={ onSetNormalizedParamValue }
				parameters={ parameters }
				thumbSize={ thumbSize }
				trackSize={ trackSize }
				ParamComponentType={ ParameterComponentType }
				extraParameterProps={{
					instanceIsMIDIMapping: waitingForMidiMapping,
					onActivateMIDIMapping: onActivateParamMIDIMapping,
					onClearMidiMapping: onClearParamMIDIMapping,
					onDecreaseIndex: onDecreaseParamIndex,
					onIncreaseIndex: onIncreaseParamIndex,
					onRemoveFromSetView: onRemoveParamFromSetView,
					listSize: parameters.size,
					patcherInstances: patcherInstances
				}}
			/>

		</div>
	);
});
