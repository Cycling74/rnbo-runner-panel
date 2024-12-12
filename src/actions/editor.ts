import { ReactFlowInstance } from "reactflow";
import { ActionBase } from "../lib/store";

export enum EditorActionType {
	INIT = "EDITOR_INIT",
	UNMOUNT = "EDITOR_UNMOUNT"
}

export interface IInitEditor extends ActionBase {
	type: EditorActionType.INIT;
	payload: {
		instance: ReactFlowInstance;
	};
}

export interface IUnmountEditor extends ActionBase {
	type: EditorActionType.UNMOUNT;
	payload: {};
}

export type EditorAction = IInitEditor | IUnmountEditor;

export const initEditor = (instance: ReactFlowInstance): IInitEditor => {
	return {
		type: EditorActionType.INIT,
		payload: { instance }
	};
};

export const unmountEditor = (): IUnmountEditor => {
	return {
		type: EditorActionType.UNMOUNT,
		payload: {}
	};
};
