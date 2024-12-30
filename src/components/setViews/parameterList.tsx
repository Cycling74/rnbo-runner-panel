import { OrderedSet as ImmuOrderedSet } from "immutable";
import { ComponentType, FC, memo } from "react";
import ParameterList, { ParameterListProps } from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import ParameterItem from "../parameter/item";
import { ParameterSetViewActionsProps, withParameterSetViewActions } from "../parameter/withSetViewActions";

const ParameterComponentType = withParameterSetViewActions(ParameterItem);
const ParameterListComponent: ComponentType<ParameterListProps<ParameterSetViewActionsProps>> = ParameterList;

export type SetViewParameterListProps = {
	parameters: ImmuOrderedSet<ParameterRecord>;
	onRestoreParamMetadata: (param: ParameterRecord) => any;
	onSaveParamMetadata: (param: ParameterRecord, meta: string) => any;
	onDecreaseParamIndex: (param: ParameterRecord) => void;
	onIncreaseParamIndex: (param: ParameterRecord) => void;
	onRemoveParamFromSetView: (param: ParameterRecord) => void;
	onSetNormalizedParamValue: (param: ParameterRecord, value: number) => void;
}

export const SetViewParameterList: FC<SetViewParameterListProps> = memo(function WrappedSetViewParameterList({
	parameters,
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
				ParamComponentType={ ParameterComponentType }
				extraParameterProps={{
					onDecreaseIndex: onDecreaseParamIndex,
					onIncreaseIndex: onIncreaseParamIndex,
					onRemoveFromSetView: onRemoveParamFromSetView,
					listSize: parameters.size
				}}
			/>

		</div>
	);
});
