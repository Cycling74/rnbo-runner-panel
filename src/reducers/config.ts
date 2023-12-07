import {
	Config, ConfigBase,
	JackConfig, InstanceConfig,
	ConfigProps, JackConfigProps, InstanceConfigProps
} from "../models/config";
import { ConfigAction, ConfigActionType } from "../actions/config";

export interface ConfigState {
	config: Config,
	jack: JackConfig,
	instance: InstanceConfig
}

const defaultConfig: ConfigState = {
	config: new Config(),
	jack: new JackConfig(),
	instance: new InstanceConfig()
};

export const config = (state: ConfigState = defaultConfig, action: ConfigAction): ConfigState => {

	switch (action.type) {

		case ConfigActionType.INIT: {
			const { config, jack, instance } = action.payload;

			return { config, jack, instance };
		}

		case ConfigActionType.UPDATE: {
			const { base, key, value } = action.payload;

			switch (base) {
				case ConfigBase.Base:
					return { ...state, config: state.config.set(key as keyof ConfigProps, value as string | boolean | string[]) };
				case ConfigBase.Jack:
					return { ...state, jack: state.jack.set(key as keyof JackConfigProps, value as string | number | number[] | string[]) };
				case ConfigBase.Instance:
					return { ...state, instance: state.instance.set(key as keyof InstanceConfigProps, value) };
				default:
					throw new Error(`unhandled base ${base}`);
			}
		}

		default:
			return state;
	}
};
