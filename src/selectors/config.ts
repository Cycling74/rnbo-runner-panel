import { RootStateType } from "../lib/store";
import { Config, InstanceConfig, JackConfig } from "../models/config";

export const getConfig = (state: RootStateType): {config: Config, jack: JackConfig, instance: InstanceConfig }  => {
	return state.config;
};
