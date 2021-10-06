
// See https://github.com/Microsoft/TypeScript/issues/1897
export type AnyJson =  boolean | number | string | null | AnyJson[] | JsonMap;
export interface JsonMap {  [key: string]: AnyJson }
