import { ReactFlowInstance } from "reactflow";
import { RootStateType } from "../lib/store";

export const getGraphEditorInstance = (state: RootStateType): ReactFlowInstance | undefined => state.editor.instance;
export const getGraphEditorLockedState = (state: RootStateType): boolean => state.editor.isLocked;
