import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOState } from "../lib/types";
import { Config, JackConfig, InstanceConfig, ConfigBase, ConfigValue } from "../models/config";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { writePacket  } from "osc";

export enum ConfigActionType {
	INIT = "INIT_CONFIG",
	UPDATE = "UPDATE_CONFIG"
}

export interface IInitConfig extends ActionBase {
	type: ConfigActionType.INIT;
	payload: {
		config: Config,
		jack?: JackConfig,
		instance: InstanceConfig
	}
}

export interface IUpdateConfig extends ActionBase {
	type: ConfigActionType.UPDATE;
	payload: {
		base: ConfigBase,
		key: string,
		value: ConfigValue
	}
}

export type ConfigAction = IInitConfig | IUpdateConfig;

const sendTypedConfig = (base: ConfigBase, key: string, value: number | string, type: string): void => {
	oscQueryBridge.sendPacket(writePacket({ address: `/rnbo${base}/config/${key}`, args: [{ value, type }] }));
};

const sendIntConfig = (base: ConfigBase, key: string, value: number): void => {
	return sendTypedConfig(base, key, value, "i");
};

const sendConfig = (base: ConfigBase, key: string, value: ConfigValue): void => {
	try {
		switch (typeof value) {
			case "string":
				sendTypedConfig(base, key, value, "s");
				break;
			case "number":
				sendTypedConfig(base, key, value, "f");
				break;
			case "boolean":
				sendTypedConfig(base, key, value ? "true" : "false", value ? "T" : "F");
				break;
			default:
				throw new Error(`unhandled type ${typeof value}`);
		}
	} catch (err) {
		console.log(err);
	}
};

export const initConfig = (desc: OSCQueryRNBOState): ConfigAction => {
	const jack = JackConfig.fromDescription(desc.CONTENTS.jack.CONTENTS.config);
	const owns_server = (desc.CONTENTS.jack.CONTENTS.info.CONTENTS?.owns_server?.TYPE || "T") === "T";
	return {
		type: ConfigActionType.INIT,
		payload: {
			config: Config.fromDescription(desc),
			jack: owns_server ? jack : null,
			instance: InstanceConfig.fromDescription(desc.CONTENTS.inst.CONTENTS.config)
		}
	};
};

export const setConfig = (base: ConfigBase, key: string, value: ConfigValue): ConfigAction => {
	return {
		type: ConfigActionType.UPDATE,
		payload: {
			base, key, value
		}
	};
};

export const updateConfig = (base: ConfigBase, key: string, value: ConfigValue): AppThunk =>
	(dispatch) => {
		sendConfig(base, key, value);
		dispatch({
			type: ConfigActionType.UPDATE,
			payload: {
				base, key, value
			}
		});
	};

export const updateIntConfig = (base: ConfigBase, key: string, value: number): AppThunk =>
	(dispatch) => {
		sendIntConfig(base, key, value);
		dispatch({
			type: ConfigActionType.UPDATE,
			payload: {
				base, key, value
			}
		});
	};

export const updateAudio = (): AppThunk =>
	async () => {
		oscQueryBridge.sendPacket(writePacket({ address: "/rnbo/jack/restart", args: [{ value: "true", type: "T" }] }));
	};
