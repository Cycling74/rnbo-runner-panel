import { OrderedSet as ImmuOrderedSet } from "immutable";
import { ComponentType, FC, memo } from "react";
import ParameterList, { ParameterListProps } from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import ParameterItem from "../parameter/item";
import { ParameterSetViewWrapProps, withParameterSetViewWrap } from "../parameter/withSetViewWrap";

const ParameterComponentType = withParameterSetViewWrap(ParameterItem);
const ParameterListComponent: ComponentType<ParameterListProps<ParameterSetViewWrapProps>> = ParameterList;

export type SetViewParameterListProps = {
	parameters: ImmuOrderedSet<ParameterRecord>;
	onDecreaseParamIndex: (param: ParameterRecord) => void;
	onIncreaseParamIndex: (param: ParameterRecord) => void;
	onRemoveParamFromSetView: (param: ParameterRecord) => void;
	onSetNormalizedParamValue: (param: ParameterRecord, value: number) => void;
}

export const SetViewParameterList: FC<SetViewParameterListProps> = memo(function WrappedSetViewParameterList({
	parameters,
	onDecreaseParamIndex,
	onIncreaseParamIndex,
	onRemoveParamFromSetView,
	onSetNormalizedParamValue
}) {

	return (
		<div className={ "" } >
			<ParameterListComponent
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
