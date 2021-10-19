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

	export function readPacket(packet: Uint8Array, options: {});
	export function writePacket(msg: OSCMessage | OSCBundle): Uint8Array;
}
