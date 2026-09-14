import { AppThunk } from "../lib/store";
import { DialogResult, showConfirmDialog } from "../lib/dialogs";
import { NotificationLevel } from "../models/notification";
import { showNotification } from "./notifications";
import { getLinkDevice, LinkDeviceKind } from "../selectors/linkDevices";
import { getLinkAudioSinks } from "../selectors/linkAudio";
import { removeLinkAudioSinkOnRemote, removeLinkAudioSourceByKeyOnRemote } from "./linkAudio";
import { getCurrentPathname, getCurrentSearchParams, pushRoute } from "../routes";
import { getNodes } from "../selectors/graph";
import { updateSetMetaOnRemoteFromNodes } from "./meta";
import { linkDevicePath } from "../lib/deviceRoutes";
import { GraphNodeRecord } from "../models/graph";

// Delete every channel a Link node stands for: a peer's Receives, or every local Send. There is
// no "remove this device" in jack_transport_link -- a node exists only because its channels do --
// so this is a fan-out of per-slot removals. They batch on the far side: each one mutates jtl's
// desired list and the reconcile that follows sees them all.
export const removeLinkDeviceOnRemote = (nodeId: GraphNodeRecord["id"]): AppThunk =>
	async (dispatch, getState) => {
		try {
			const state = getState();
			const device = getLinkDevice(state, nodeId);
			if (!device) return;

			const isSend = device.kind === LinkDeviceKind.Send;
			const count = device.slotKeys.length;
			const noun = count === 1 ? "channel" : "channels";

			const dialogResult = await showConfirmDialog({
				text: isSend
					? `Are you sure you want to delete ${ device.label } and stop announcing its ${ count } ${ noun } to the Link session?`
					: `Are you sure you want to delete ${ device.label } and its ${ count } received ${ noun }?`,
				actions: {
					confirm: { label: "Delete Device", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) return;

			if (isSend) {
				// sinks/remove addresses a Send by its announced name, so resolve each key first
				const sinks = getLinkAudioSinks(state);
				for (const key of device.slotKeys) {
					const sink = sinks.get(key);
					if (sink) dispatch(removeLinkAudioSinkOnRemote(sink.name));
				}
			} else {
				for (const key of device.slotKeys) {
					dispatch(removeLinkAudioSourceByKeyOnRemote(key));
				}
			}

			// drop the node's saved position from the set, the same way unloading a device does
			dispatch(updateSetMetaOnRemoteFromNodes(getNodes(state).delete(nodeId).valueSeq().toArray()));

			// the node is about to disappear; don't leave the user on its now-dead device page
			if (getCurrentPathname().startsWith(linkDevicePath(nodeId))) {
				pushRoute({ pathname: "/", query: { ...getCurrentSearchParams() } });
			}
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to delete Link device",
				message: err.message
			}));
			console.error(err);
		}
	};
