import { ChangeEvent, FC, memo, useCallback } from "react";
import { PatcherInstanceRecord } from "../../models/instance";
import { NativeSelect } from "@mantine/core";
import { Map as ImmuMap } from "immutable";
import styles from "./instance.module.css";
import { IconElement } from "../elements/icon";
import { mdiVectorSquare } from "@mdi/js";

export type InstanceSelectTitleProps = {
	currentInstanceId: PatcherInstanceRecord["id"];
	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	onChangeInstance: (instance: PatcherInstanceRecord) => void;
};

const collator = new Intl.Collator("en-US", { numeric: true });

export const InstanceSelectTitle: FC<InstanceSelectTitleProps> = memo(function WrappedInstanceSelectTitle({
	currentInstanceId,
	instances,
	onChangeInstance
}) {

	const onTriggerChangeInstance = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		const instance = instances.get(e.currentTarget.value);
		onChangeInstance(instance);
	}, [instances, onChangeInstance]);

	return (
		<NativeSelect
			className={ styles.title }
			data={ instances.valueSeq().sort((a, b) => collator.compare(a.id, b.id)).toArray().map(d => ({ value: d.id, label: d.displayName })) }
			leftSection={ <IconElement path={ mdiVectorSquare } size="1em" /> }
			onChange={ onTriggerChangeInstance }
			value={ currentInstanceId }
			variant="unstyled"
		/>
	);
});
