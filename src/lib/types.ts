
// See https://github.com/Microsoft/TypeScript/issues/1897
export type AnyJson =
 | string
 | number
 | boolean
 | null
 | AnyJson[]
 | {[key: string]: AnyJson}

export interface JsonMap {  [key: string]: AnyJson }
