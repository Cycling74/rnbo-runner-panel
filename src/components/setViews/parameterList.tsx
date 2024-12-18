import { OrderedSet as ImmuOrderedSet } from "immutable";
import { FC, memo, useCallback } from "react";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import ParameterItem from "../parameter/item";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { clearParameterMIDIMappingOnRemote, restoreDefaultParameterMetaOnRemote, setInstanceParameterMetaOnRemote, setInstanceParameterValueNormalizedOnRemote } from "../../actions/patchers";

export type SetViewParameterListProps = {
	parameters: ImmuOrderedSet<ParameterRecord>;
}

export const SetViewParameterList: FC<SetViewParameterListProps> = memo(function WrappedSetViewParameterList({
	parameters
}) {

	const dispatch = useAppDispatch();
	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setInstanceParameterValueNormalizedOnRemote(param, val));
	}, [dispatch]);

	const onSaveParameterMetadata = useCallback((param: ParameterRecord, meta: string) => {
		dispatch(setInstanceParameterMetaOnRemote(param, meta));
	}, [dispatch]);

	const onRestoreDefaultParameterMetadata = useCallback((param: ParameterRecord) => {
		dispatch(restoreDefaultParameterMetaOnRemote(param));
	}, [dispatch]);

	const onClearParameterMidiMapping = useCallback((param: ParameterRecord) => {
		dispatch(clearParameterMIDIMappingOnRemote(param));
	}, [dispatch]);

	return (
		<div className={ "" } >
			<ParameterList
				onSetNormalizedValue={ onSetNormalizedParamValue }
				onSaveMetadata={ onSaveParameterMetadata }
				onRestoreMetadata={ onRestoreDefaultParameterMetadata }
				onClearMidiMapping={ onClearParameterMidiMapping }
				parameters={ parameters }
				ParamComponentType={ ParameterItem }
				extraParameterProps={{}}
			/>

		</div>
	);
});
