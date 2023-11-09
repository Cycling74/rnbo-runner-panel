import { RootStateType } from "../lib/store";
import { Config } from "../models/config";

export const getConfig = (state: RootStateType): Config => {
	return state.config.config;
};
