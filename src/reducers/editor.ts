import { EditorAction, EditorActionType } from "../actions/editor";
import { ReactFlowInstance } from "reactflow";

export type EditorState = {
	instance?: ReactFlowInstance;
};

export const editor = (state: EditorState = {}, action: EditorAction): EditorState => {
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

		default:
			return state;
	}
};
