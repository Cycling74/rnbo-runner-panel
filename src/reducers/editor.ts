import { EditorAction, EditorActionType } from "../actions/editor";
import { ReactFlowInstance } from "reactflow";

export type EditorState = {
	instance?: ReactFlowInstance;
	isLocked: boolean;
};

export const editor = (state: EditorState = {
	isLocked: false
}, action: EditorAction): EditorState => {
	switch (action.type) {

		case EditorActionType.INIT: {
			return {
				...state,
				instance: action.payload.instance
			};
		}

		case EditorActionType.UNMOUNT: {
			return {
				...state,
				instance: undefined
			};
		}

		case EditorActionType.SET_LOCKED: {
			return {
				...state,
				isLocked: action.payload.locked
			};
		}

		default:
			return state;
	}
};
