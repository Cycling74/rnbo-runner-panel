import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { EditorNodeRecord } from "../models/editor";

export const getEditorNode = (state: RootStateType, id: EditorNodeRecord["id"]): EditorNodeRecord | undefined => state.editor.nodes.get(id);
export const getEditorNodes = (state: RootStateType): ImmuMap<EditorNodeRecord["id"], EditorNodeRecord> => state.editor.nodes;
