import { writePacket } from "osc";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries, OSCValue } from "../lib/types";
import { PresetRecord } from "../models/preset";
import { PatcherRecord } from "../models/patcher";
import { AppThunk } from "../lib/store";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { ConnectionType, GraphConnectionRecord, GraphPatcherNodeRecord, GraphPortRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";
import { getConnectionsForSinkNodeAndPort, getConnectionsForSourceNodeAndPort, getNode, getNodeByIndex, getPatcherNodesByIndex } from "../selectors/graph";
import { deleteConnections, deleteNode, setConnections, setNode } from "./graph";
import { MessageInportRecord, MessageOutputRecord } from "../models/messages";
import throttle from "lodash.throttle";
import { ParameterRecord } from "../models/parameter";
import { getSetting } from "../selectors/settings";
import { Setting } from "../reducers/settings";
import Router from "next/router";

export const loadPresetOnRemoteInstance = (node: GraphPatcherNodeRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${node.path}/presets/load`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load preset ${preset.name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const savePresetToRemoteInstance = (node: GraphPatcherNodeRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${node.path}/presets/save`,
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save preset ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const loadPatcherToRemoteInstance = (instanceIndex: number, patcher: PatcherRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/load",
				args: [
					{ type: "i", value: instanceIndex },
					{ type: "s", value: patcher.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load patcher ${patcher.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const unloadPatcherFromRemoteInstance = (device: GraphPatcherNodeRecord): AppThunk =>
	(dispatch) => {
		try {

			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: device.index }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to unload patcher",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const addRemoteInstance = (patcher: PatcherRecord): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const patchersByIndex = getPatcherNodesByIndex(state);

			let instanceIndex = 0;
			for (;instanceIndex < patchersByIndex.size; instanceIndex++) {
				const patcher = patchersByIndex.get(instanceIndex);
				if (!patcher) break;
			}

			const message = {
				address: "/rnbo/inst/control/load",
				args: [
					{ type: "i", value: instanceIndex },
					{ type: "s", value: patcher.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load patcher ${patcher.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const setInstanceSourcePortConnections = (device: GraphPatcherNodeRecord, port: GraphPortRecord, connections: GraphConnectionRecord[]): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${device.path}/jack/connections/${port.type === ConnectionType.Audio ? "audio" : "midi"}/sources/${port.id}`,
				args: connections.length ? connections.map(conn => {
					const id = conn.sinkNodeId === GraphSystemNodeRecord.systemOutputName ? GraphSystemNodeRecord.systemName : conn.sinkNodeId;
					return {
						type: "s",
						value: `${id}:${conn.sinkPortId}`
					};
				}) : [ { type: "N", value: "" } ]
			};

			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to update connections",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const setInstanceSinkPortConnections = (device: GraphPatcherNodeRecord, port: GraphPortRecord, connections: GraphConnectionRecord[]): AppThunk =>
	(dispatch) => {

		try {
			const message = {
				address: `${device.path}/jack/connections/${port.type === ConnectionType.Audio ? "audio" : "midi"}/sinks/${port.id}`,
				args: connections.length ? connections.map(conn => {
					const id = conn.sourceNodeId === GraphSystemNodeRecord.systemInputName ? GraphSystemNodeRecord.systemName : conn.sourceNodeId;
					return {
						type: "s",
						value: `${id}:${conn.sourcePortId}`
					};
				}) : [ { type: "N", value: "" } ]
			};

			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to update connections",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};


export const sendMessageToRemoteInstanceInport = (instance: GraphPatcherNodeRecord, msgInport: MessageInportRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `/rnbo/inst/${instance.index}/messages/in/${msgInport.name}`,
			args: [{ type: "s", value }] // values.map(value => ({ type: "f", value }))
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerMidiNoteOnEventOnRemoteInstance = (device: GraphPatcherNodeRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 144 + midiChannel;
		const velocityByte = 100;

		const message = {
			address: `${device.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerMidiNoteOffEventOnRemoteInstance = (device: GraphPatcherNodeRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 128 + midiChannel;
		const velocityByte = 0;

		const message = {
			address: `${device.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setParameterValueNormalizedOnRemote = throttle((device: GraphPatcherNodeRecord, param: ParameterRecord, value: number): AppThunk =>
	(dispatch) => {

		const message = {
			address: `${param.path}/normalized`,
			args: [
				{ type: "f", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));

		// optimistic local state update
		dispatch(setNode(device.setParameterNormalizedValue(param.id, value)));
	}, 100);


export const addInstance = (desc: OSCQueryRNBOInstance): AppThunk =>
	(dispatch) => {
		// Create Node
		const node = GraphPatcherNodeRecord.fromDescription(desc);
		dispatch(setNode(node));

		// Create Edges
		const connections = GraphConnectionRecord.connectionsFromDescription(node.id, desc.CONTENTS.jack.CONTENTS.connections);
		dispatch(setConnections(connections));
	};

export const removeInstance = (index: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(deleteNode(node));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetEntries = (index: number, entries: OSCQueryRNBOInstancePresetEntries): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(
				node.set("presets", GraphPatcherNodeRecord.presetsFromDescription(entries))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessages = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(
				node
					.set("messageInputs", GraphPatcherNodeRecord.messageInputsFromDescription(desc))
					.set("messageOutputs", GraphPatcherNodeRecord.messageOutputsFromDescription(desc))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutputValue = (index: number, id: MessageOutputRecord["id"], value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getSetting(state, Setting.debugMessageOutput);
			if (!enabled) return;

			// Active Device view?!
			if (Router.asPath !== `/devices/${index}`) return;

			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(node.setMessageOutportValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameters = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(
				node.set("parameters", GraphPatcherNodeRecord.parametersFromDescription(desc))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValue = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(node.setParameterValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValueNormalized = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;

			dispatch(setNode(node.setParameterNormalizedValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceSourcePortConnections = (index: number, portId: GraphPortRecord["id"], sinks: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const sourceNode = getNodeByIndex(state, index);
			if (sourceNode?.type !== NodeType.Patcher) return;

			const sourcePort = sourceNode.getPort(portId);
			if (!sourcePort) return;

			const existingConnections = getConnectionsForSourceNodeAndPort(state, { sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id });
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			const connections = [];
			for (const sink of sinks) {
				const [sinkNodeId, sinkPortId] = sink.split(":");

				const sinkNode = getNode(state, sinkNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemOutputName : sinkNodeId);
				if (!sinkNode) continue;
				const sinkPort = sinkNode.getPort(sinkPortId);
				if (!sinkPort) continue;

				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
			}

			if (connections.length) dispatch(setConnections(connections));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceSinkPortConnections = (index: number, portId: GraphPortRecord["id"], sources: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const sinkNode = getNodeByIndex(state, index);
			if (sinkNode?.type !== NodeType.Patcher) return;

			const sinkPort = sinkNode.getPort(portId);
			if (!sinkPort) return;

			const existingConnections = getConnectionsForSinkNodeAndPort(state, { sinkNodeId: sinkNode.id, sinkPortId: sinkPort.id });
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			const connections = [];
			for (const source of sources) {
				const [sourceNodeId, sourcePortId] = source.split(":");

				const sourceNode = getNode(state, sourceNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemInputName : sourceNodeId);
				if (!sourceNode) continue;

				const sourcePort = sinkNode.getPort(sourcePortId);
				if (!sourcePort) continue;

				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
			}

			if (connections.length) dispatch(setConnections(connections));

		} catch (e) {
			console.log(e);
		}
	};
