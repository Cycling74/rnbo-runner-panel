import { Config, ConfigBase } from "../models/config";
import { ConfigAction, ConfigActionType } from "../actions/config";

export interface ConfigState {
	config: Config
}

const defaultConfig: ConfigState = { config: new Config() };

export const config = (state: ConfigState = defaultConfig, action: ConfigAction): ConfigState => {

	switch (action.type) {

		case ConfigActionType.INIT: {
			const { config } = action.payload;

			return { config };
		}

		case ConfigActionType.UPDATE: {
			const { base, key, value } = action.payload;

			let config = state.config;

			switch (base) {
				case ConfigBase.Base:
					config = { ...config, [key]: value };
					break;
				case ConfigBase.Jack:
					config = { ...config, jack: {...config.jack, [key]: value }};
					break;
				case ConfigBase.Instance:
					config = { ...config, instance: {...config.instance, [key]: value }};
					break;
				default:
					throw new Error(`unknown config base ${base}`);
			}

			return { config };

		}

		default:
			return state;
	}
};
