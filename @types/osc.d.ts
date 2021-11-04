declare module "osc" {

	export type OSCTimeTag = {
		raw: [number, number];
		native: number;
	};

	export type OSCArgument = {
		type: string;
		value: string | number;
	};

	export type OSCMessage = {
		address: string;
		args: OSCArgument[];
	};

	export type OSCBundle = {
		timeTag: OSCTimeTag;
		packets: Array<OSCMessage | OSCBundle>;
	};

	export type PacketOptions = {
		metadata?: boolean;
		unpackSingleArgs?: boolean;
	};

	export type OffsetState = {
		idx: number;
		length: number;
	};

	export function readPacket(packet: Uint8Array, options: PacketOptions, offsetState?: OffsetState): OSCMessage | OSCBundle;
	export function writePacket(msg: OSCMessage | OSCBundle, options?: PacketOptions): Uint8Array;
}
