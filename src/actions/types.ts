import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { OSCQueryBridgeController } from "../controller/oscqueryBridgeController";
import { RootStateType } from "../reducers";

export interface ActionBase extends AnyAction {
	type: string,
	error?: Error,
	payload: Record<string, any>
};

export type AppThunkExtraArg = {
	oscQueryBridgeController: OSCQueryBridgeController;
};

export type AppThunkResult<R = void> = ThunkAction<
  R,
  RootStateType,
  AppThunkExtraArg,
  ActionBase
>;
