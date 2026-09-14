import { ChangeEvent, FC, memo, useCallback, useMemo } from "react";
import { NativeSelect } from "@mantine/core";
import { Map as ImmuMap } from "immutable";
import { mdiCastAudio, mdiVectorSquare } from "@mdi/js";
import styles from "./instance.module.css";
import { IconElement } from "../elements/icon";
import { PatcherInstanceRecord } from "../../models/instance";
import { LinkDeviceDesc } from "../../selectors/linkDevices";
import {
	isLinkDeviceValue, linkDevicePath, linkDeviceValue, patcherDevicePath, patcherDeviceValue
} from "../../lib/deviceRoutes";

export type DeviceSelectTitleProps = {
	// the currently displayed device, as a namespaced value from lib/deviceRoutes
	currentValue: string;
	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	linkDevices: LinkDeviceDesc[];
	onChangeDevice: (pathname: string) => void;
};

const collator = new Intl.Collator("en-US", { numeric: true });

export const DeviceSelectTitle: FC<DeviceSelectTitleProps> = memo(function WrappedDeviceSelectTitle({
	currentValue,
	instances,
	linkDevices,
	onChangeDevice
}) {

	const pathByValue = useMemo(() => {
		const map = new Map<string, string>();
		instances.forEach(i => map.set(patcherDeviceValue(i.id), patcherDevicePath(i.id)));
		linkDevices.forEach(d => map.set(linkDeviceValue(d.nodeId), linkDevicePath(d.nodeId)));
		return map;
	}, [instances, linkDevices]);

	const data = useMemo(() => {
		const groups: Array<{ group: string; items: Array<{ value: string; label: string }> }> = [];

		const patcherItems = instances
			.valueSeq()
			.sort((a, b) => collator.compare(a.id, b.id))
			.toArray()
			.map(d => ({ value: patcherDeviceValue(d.id), label: d.displayName }));
		if (patcherItems.length) groups.push({ group: "Devices", items: patcherItems });

		// Link devices come last, matching where they sit in the graph
		if (linkDevices.length) {
			groups.push({
				group: "Link",
				items: linkDevices.map(d => ({ value: linkDeviceValue(d.nodeId), label: d.label }))
			});
		}

		return groups;
	}, [instances, linkDevices]);

	const onTriggerChangeDevice = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		const pathname = pathByValue.get(e.currentTarget.value);
		if (pathname) onChangeDevice(pathname);
	}, [pathByValue, onChangeDevice]);

	return (
		<NativeSelect
			className={ styles.title }
			data={ data }
			leftSection={ <IconElement path={ isLinkDeviceValue(currentValue) ? mdiCastAudio : mdiVectorSquare } size="1em" /> }
			onChange={ onTriggerChangeDevice }
			value={ currentValue }
			variant="unstyled"
		/>
	);
});
