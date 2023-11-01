import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { EditorEdgeRecord, EditorNodeRecord } from "../models/editor";

export const getEditorNode = (state: RootStateType, id: EditorNodeRecord["id"]): EditorNodeRecord | undefined => state.editor.nodes.get(id);
export const getEditorNodes = (state: RootStateType): ImmuMap<EditorNodeRecord["id"], EditorNodeRecord> => state.editor.nodes;

export const getEditorEdge = (state: RootStateType, id: EditorEdgeRecord["id"]): EditorEdgeRecord | undefined => state.editor.edges.get(id);
export const getEditorEdges = (state: RootStateType): ImmuMap<EditorEdgeRecord["id"], EditorEdgeRecord> => state.editor.edges;
