import { compose } from "redux";

// See https://github.com/Microsoft/TypeScript/issues/1897
export type AnyJson =  boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap {  [key: string]: AnyJson }
export interface JsonArray extends Array<AnyJson> {}

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
	}
}
