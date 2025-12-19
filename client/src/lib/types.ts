import { ConnectionType } from "../models/graph";
import { JackInfoKey, KnownPortGroup, RNBOJackPortPropertyKey, RunnerCmdResultCode, SystemInfoKey } from "./constants";

declare global {
	const __APP_VERSION__: string;
}

// See https://github.com/Microsoft/TypeScript/issues/1897
export type AnyJson =
 | string
 | number
 | boolean
 | null
 | AnyJson[]
 | {[key: string]: AnyJson}

export interface JsonMap {  [key: string]: AnyJson }

export type MIDIControlChangeMetaMapping = {
	chan: number;
	ctrl: number;
};

export type MIDINoteMetaMapping = {
	chan: number;
	note: number;
};

export type MIDIKeypressMetaMapping = {
	chan: number;
	keypress: number;
};

export type MIDIPitchBendMetaMapping = {
	bend: number;
};

export type MIDIProgramChangeMetaMapping = {
	prgchg: number;
};

export type MIDIChannelPressureMetaMapping = {
	chanpress: number;
};

export type MIDIIndividualScopedMetaMapping = MIDIControlChangeMetaMapping | MIDINoteMetaMapping | MIDIKeypressMetaMapping;
export type MIDIChannelScopedMetaMapping = MIDIPitchBendMetaMapping | MIDIProgramChangeMetaMapping | MIDIChannelPressureMetaMapping;

export type MIDIMetaMapping = MIDIIndividualScopedMetaMapping | MIDIChannelScopedMetaMapping;

export type ParameterMetaJsonMap = JsonMap & {
	midi?: MIDIMetaMapping;
};

export type DataRefMetaJsonMap = JsonMap;
export type RunnerInfoKey = SystemInfoKey | JackInfoKey;

// Runner CMD Types
export type RunnerCmdResultPayload = Record<string, any> & { message: string };

export type RunnerCmdResult<R extends RunnerCmdResultPayload> = R & {
	code: number | RunnerCmdResultCode;
	message: R["message"];
	progress: number;
};

export type RunnerCmdResponse<R extends RunnerCmdResult<{ message: string; }> = RunnerCmdResult<{ message: string; }>> = {
	id: string;
	error?: { code: number; message: string; };
	jsonrpc: "2.0";
	result?: RunnerCmdResult<R>;
};

export type RunnerReadFileListResult = RunnerCmdResult<{
	content: string;
	message: "read";
	remaining: number;
	seq: number;
}>;

export type RunnerReadFileListResponse = RunnerCmdResponse<RunnerReadFileListResult>;

export type RunnerInstallPackageResult = RunnerCmdResult<{
	message: "completed",
	packagename: string;
	filename: string;
}>;

export type RunnerInstallPackageResponse = RunnerCmdResponse<RunnerInstallPackageResult>;

export type RunnerReadFileContentResult = RunnerCmdResult<{
	content64: string;
	message: "read";
	md5?: string;
	remaining: number;
	seq: number;
}>;

export type RunnerReadFileContentResponse = RunnerCmdResponse<RunnerReadFileContentResult>;

export type RunnerDeleteFileResult = RunnerCmdResult<{
	message: "received" | "deleted";
}>;

export type RunnerDeleteFileResponse = RunnerCmdResponse<RunnerDeleteFileResult>;

// Package Info

export type RunnerPackageDataFileInfo = {
	location: string;
	name: string;
};

export type RunnerPackagePatcherInfo = {
	binaries: Record<string, string>;
	config: string;
	created_at: string;
	name: string;
	patcher: string;
	presets: string;
};

export type RunnerPackageSetInfo = {
	created_at: string;
	location: string;
	name: string;
};

export type RunnerPackageTargetInfo = {
	compiler_id: string;
	compiler_version: string;
	dir: string;
	system_name: string;
	system_processor: string;
};

export type RunnerPackageInfo = {
	datafiles: Array<RunnerPackageDataFileInfo>;
	name: string;
	patchers: Array<RunnerPackagePatcherInfo>;
	rnbo_version: string;
	runner_version: string;
	schema_version: 1;
	sets: Array<RunnerPackageSetInfo>;
	targets: Record<string, RunnerPackageTargetInfo>;
};

// OSC Types
export type OSCValue = string | number | null;

export enum OSCAccess {
	ReadOnly = 1,
	WriteOnly = 2,
	ReadWrite = 3
}

export enum OSCClipMode {
	None = "none"
}


export type OSCQueryBaseNode = {
	FULL_PATH: string;
	DESCRIPTION?: string;
}

export enum OSCQueryValueType {
	Unknown = "",
	Blob = "b",
	Char = "c",
	Double64 = "d",
	False = "F",
	Float32 = "f",
	Infinitum = "I",
	Int32 = "i",
	Nil = "N",
	String = "s",
	Timetag = "t",
	True = "T"
}

export type OSCQuerySingleValue<T extends OSCQueryValueType, V extends OSCValue | Array<OSCValue>> = OSCQueryBaseNode & ({
	TYPE: T;
	VALUE: V;
	ACCESS: OSCAccess;
	CLIPMODE: OSCClipMode;
	EXTENDED_TYPE: undefined;
});

export type OSCQueryListValue<T extends string = string, V extends Array<OSCValue> = Array<OSCValue>> = OSCQueryBaseNode & {
	TYPE: T;
	VALUE: V;
	ACCESS: OSCAccess;
	CLIPMODE: OSCClipMode;
	EXTENDED_TYPE: "list"
};

export type OSCQueryFalseValue = OSCQuerySingleValue<OSCQueryValueType.False, null>;
export type OSCQueryCharValue = OSCQuerySingleValue<OSCQueryValueType.Char, string>;
export type OSCQueryDoubleValue = OSCQuerySingleValue<OSCQueryValueType.Double64, number>;
export type OSCQueryFloatValue = OSCQuerySingleValue<OSCQueryValueType.Float32, number>;
export type OSCQueryInfValue = OSCQuerySingleValue<OSCQueryValueType.Infinitum, null>;
export type OSCQueryIntValue = OSCQuerySingleValue<OSCQueryValueType.Int32, number>;
export type OSCQueryNilValue = OSCQuerySingleValue<OSCQueryValueType.Nil, null>;
export type OSCQueryStringValue = OSCQuerySingleValue<OSCQueryValueType.String, string>;
export type OSCQueryTimetagValue = OSCQuerySingleValue<OSCQueryValueType.Timetag, string>;
export type OSCQueryTrueValue = OSCQuerySingleValue<OSCQueryValueType.True, null>;

export type OSCQueryBooleanValue = OSCQueryFalseValue | OSCQueryTrueValue;
export type OSCQueryUnknownValue = OSCQuerySingleValue<OSCQueryValueType.Unknown, "">;

export type OSCQueryValue = OSCQueryFalseValue | OSCQueryCharValue | OSCQueryDoubleValue | OSCQueryFloatValue | OSCQueryInfValue |
OSCQueryIntValue | OSCQueryNilValue | OSCQueryStringValue | OSCQueryTimetagValue | OSCQueryTrueValue | OSCQueryUnknownValue | OSCQueryListValue;

export type OSCQueryValueRange = {
	RANGE?: {
		0: {
			MIN?: number;
			MAX?: number;
			VALS?: Array<number>;
		};
	};
}

export type OSCQueryStringValueRange = {
	RANGE?: {
		0: {
			VALS?: Array<string>;
		};
	};
}

export type OSCQueryRNBOInfoState = OSCQueryBaseNode & {
	CONTENTS: {
		[SystemInfoKey.CompilerId]: OSCQueryStringValue;
		[SystemInfoKey.CompilerVersion]: OSCQueryStringValue;
		[SystemInfoKey.DiskBytesAvailable]: OSCQueryStringValue;
		[SystemInfoKey.RNBOVersion]: OSCQueryStringValue;
		[SystemInfoKey.RunnerVersion]: OSCQueryStringValue;
		[SystemInfoKey.SystemId]: OSCQueryStringValue;
		[SystemInfoKey.SystemName]: OSCQueryStringValue;
		[SystemInfoKey.SystemOS]: OSCQueryStringValue;
		[SystemInfoKey.SystemProcessor]: OSCQueryStringValue;
		[SystemInfoKey.TargetId]: OSCQueryStringValue;
		supported_cmds: OSCQueryListValue;
		unpported_cmds: OSCQueryListValue;
		update: OSCQueryBaseNode & {
			CONTENTS: {
				supported: OSCQueryBooleanValue;
			};
		}
	};
};

export type OSCQueryRNBOConfigState = OSCQueryBaseNode & {
	CONTENTS: {
		patcher_midi_program_change_channel: OSCQueryStringValue & OSCQueryStringValueRange;
		control_auto_connect_midi: OSCQueryBooleanValue;
	}
};

export type OSCQueryRNBOInstancesConfig = OSCQueryBaseNode & {
	CONTENTS: {
		auto_connect_audio: OSCQueryBooleanValue;
		auto_connect_audio_indexed: OSCQueryBooleanValue;
		auto_connect_midi: OSCQueryBooleanValue;
		auto_start_last: OSCQueryBooleanValue;
		audio_fade_in: OSCQueryFloatValue;
		audio_fade_out: OSCQueryFloatValue;
		preset_midi_program_change_channel: OSCQueryStringValue & OSCQueryStringValueRange;
	}
};

export type RNBOJackPortProperties = {
	[RNBOJackPortPropertyKey.InstanceId]?: number;
	[RNBOJackPortPropertyKey.Physical]?: true;
	[RNBOJackPortPropertyKey.PortGroup]?: KnownPortGroup | string;
	[RNBOJackPortPropertyKey.PrettyName]?: string;
	[RNBOJackPortPropertyKey.Source]: boolean;
	[RNBOJackPortPropertyKey.Terminal]?: true;
	[RNBOJackPortPropertyKey.Type]: ConnectionType;
}

export type OSCQueryRNBOJackPortInfo = OSCQueryBaseNode & {
	CONTENTS: {
		audio: OSCQueryBaseNode & {
			CONTENTS: {
				sinks: OSCQueryListValue<string, string[]>;
				sources: OSCQueryListValue<string, string[]>;
			};
		};
		midi: OSCQueryBaseNode & {
			CONTENTS: {
				sinks: OSCQueryListValue<string, string[]>;
				sources: OSCQueryListValue<string, string[]>;
			};
		};
		aliases: OSCQueryBaseNode & {
			CONTENTS?: Record<string, OSCQueryListValue<string, string[]>>;
		};
		properties: OSCQueryBaseNode & {
			CONTENTS: Record<string, OSCQueryStringValue>;
		};
	};
};

export type OSCQueryRNBOJackConnections = OSCQueryBaseNode & {
	CONTENTS: {
		audio: OSCQueryBaseNode & {
			CONTENTS?: Record<string, OSCQueryListValue<string, string[]>>;
		};
		midi: OSCQueryBaseNode & {
			CONTENTS?: Record<string, OSCQueryListValue<string, string[]>>;
		};
	};
};

export type OSCQueryRNBOJackConfig = OSCQueryBaseNode & {
	CONTENTS: {
		period_frames: OSCQueryIntValue & OSCQueryValueRange;
		sample_rate: OSCQueryFloatValue & OSCQueryValueRange;
		num_periods?: OSCQueryIntValue & OSCQueryValueRange;
		card?: OSCQueryStringValue & OSCQueryStringValueRange;
		midi_system?: OSCQueryStringValue & OSCQueryStringValueRange;
		extra?: OSCQueryStringValue;
	};
};

export type OSCQueryRNBOJackTransport = OSCQueryBaseNode & {
	CONTENTS: {
		bpm: OSCQueryFloatValue;
		rolling: OSCQueryBooleanValue;
		sync: OSCQueryBooleanValue;
	}
}

export type OSCQueryRNBOJackRecord = OSCQueryBaseNode & {
	CONTENTS: {
		active: OSCQueryBooleanValue;
		captured: OSCQueryFloatValue;
		channels: OSCQueryIntValue & OSCQueryValueRange;
		timeout: OSCQueryFloatValue & OSCQueryValueRange;
	}
};

export type OSCQueryRNBOJackInfoState =  OSCQueryBaseNode & {
	CONTENTS: {
		is_realtime?: OSCQueryBooleanValue;
		owns_server?: OSCQueryBooleanValue;
		ports?: OSCQueryRNBOJackPortInfo;
		is_active?: OSCQueryBooleanValue;
		[JackInfoKey.CPULoad]?: OSCQueryFloatValue;
		[JackInfoKey.XRunCount]?: OSCQueryIntValue;
	};
};

export type OSCQueryRNBOJackState = OSCQueryBaseNode & {
	CONTENTS: {
		active: OSCQueryBooleanValue;
		connections?: OSCQueryRNBOJackConnections,
		info?: OSCQueryRNBOJackInfoState;
		config: OSCQueryRNBOJackConfig;
		control: any;
		record?: OSCQueryRNBOJackRecord;
		transport?: OSCQueryRNBOJackTransport;
	};
};

export type OSCQueryRNBOPatcher = OSCQueryBaseNode & {
	CONTENTS: {
		io: OSCQueryListValue<"iiii", [number, number, number, number]>;
		created_at: OSCQueryStringValue;
		destroy: OSCQueryInfValue;
	};
}

export type OSCQueryRNBOPatchersState = OSCQueryBaseNode & {
	CONTENTS: Record<string, OSCQueryRNBOPatcher>;
};

export type OSCQueryRNBOInstanceParameterValue = OSCQueryBaseNode & OSCQueryFloatValue & OSCQueryValueRange & {
	CONTENTS: {
		display_name: OSCQueryStringValue;
		index: OSCQueryIntValue;
		meta: OSCQueryStringValue;
		normalized: OSCQueryFloatValue & OSCQueryValueRange & { VALUE: number; }
	};
	VALUE: number | string;
};

export type OSCQueryRNBOInstanceParameterInfo = OSCQueryRNBOInstanceParameterValue | {
	CONTENTS: Record<string, OSCQueryRNBOInstanceParameterInfo>;
	VALUE: undefined;
};

export type OSCQueryRNBOInstanceMessageValue = OSCQueryBaseNode & OSCQueryListValue<string> & {
	CONTENTS: {
		meta: OSCQueryStringValue;
	};
	VALUE: string[];
};

export type OSCQueryRNBOInstanceMessageInfo = OSCQueryRNBOInstanceMessageValue | {
	CONTENTS: Record<string, OSCQueryRNBOInstanceMessageInfo>;
	VALUE: undefined;
};

export type OSCQueryRNBOInstanceMessages = OSCQueryBaseNode & {
	CONTENTS: Record<string, OSCQueryRNBOInstanceMessageInfo>;
};


export type OSCQueryRNBOInstanceDataRefInfo = OSCQueryStringValue & {
	CONTENTS: {
		meta: OSCQueryStringValue;
	};
};

export type OSCQueryRNBOInstanceDataRefs = OSCQueryBaseNode & {
	CONTENTS: Record<string, OSCQueryRNBOInstanceDataRefInfo>
};

export type OSCQueryRNBOInstancePresetEntries = OSCQueryListValue<string, string[]>;

export type OSCQueryRNBOInstanceConnection = OSCQueryListValue<string, string[]>;
export type OSCQueryRNBOInstanceConnectionsInfo = OSCQueryBaseNode & {
	CONTENTS: {
		sinks: OSCQueryBaseNode & {
			CONTENTS?: Record<string, OSCQueryRNBOInstanceConnection>;
		};
		sources: OSCQueryBaseNode & {
			CONTENTS?: Record<string, OSCQueryRNBOInstanceConnection>;
		};
	};
};
export type OSCQueryRNBOInstanceConnections = OSCQueryBaseNode & {
	CONTENTS: {
		audio: OSCQueryRNBOInstanceConnectionsInfo;
		midi: OSCQueryRNBOInstanceConnectionsInfo;
	};
};

export type OSCQueryRNBOInstanceConfig = OSCQueryBaseNode & {
	CONTENTS: {
		name_alias: OSCQueryStringValue;
		set_preset_patcher_named: OSCQueryBooleanValue;
	};
};

export type OSCQueryRNBOInstance = OSCQueryBaseNode & {
	CONTENTS: {
		jack: OSCQueryBaseNode & {
			CONTENTS: {
				connections: OSCQueryRNBOInstanceConnections;
				name: OSCQueryStringValue;
				audio_ins: OSCQueryListValue<string, string[]>;
				audio_outs: OSCQueryListValue<string, string[]>;
				midi_ins: OSCQueryListValue<string, string[]>;
				midi_outs: OSCQueryListValue<string, string[]>;
			};
		};
		name: OSCQueryStringValue;
		params: OSCQueryBaseNode & {
			CONTENTS: Record<string, OSCQueryRNBOInstanceParameterInfo>;
			VALUE: undefined
		};
		config: OSCQueryRNBOInstanceConfig;
		data_refs: OSCQueryRNBOInstanceDataRefs;
		presets: OSCQueryBaseNode & {
			CONTENTS: {
				entries: OSCQueryRNBOInstancePresetEntries;
				del: OSCQueryStringValue;
				delete: OSCQueryStringValue;
				initial: OSCQueryStringValue;
				load: OSCQueryStringValue;
				loaded: OSCQueryStringValue;
				save: OSCQueryStringValue;
			};
		};
		messages?: OSCQueryBaseNode & {
			CONTENTS: {
				in?: OSCQueryRNBOInstanceMessages;
				out?: OSCQueryRNBOInstanceMessages;
			};
		};
		midi: OSCQueryBaseNode & {
			CONTENTS: {
				in: OSCQueryBaseNode & {
					CONTENTS: Record<string, OSCQueryUnknownValue>;
				};
				out: OSCQueryBaseNode & {
					CONTENTS: Record<string, OSCQueryUnknownValue>;
				};
			};
		};
	}
};

export type OSCQueryRNBOInstancesMetaState = OSCQuerySingleValue<OSCQueryValueType.String, string>;

export type OSCQueryRNBOSetView = OSCQueryBaseNode & {
	CONTENTS: {
		name: OSCQueryStringValue;
		params: OSCQueryListValue<string, string[]>;
	}
};

export type OSCQueryRNBOSetViewListState = OSCQueryBaseNode & {
	CONTENTS: Record<string, OSCQueryRNBOSetView>;
};

export type OSCQueryRNBOSetViewState = OSCQueryBaseNode & {
	CONTENTS: {
		list: OSCQueryRNBOSetViewListState;
		order: OSCQueryListValue<string, number[]>;
	};
};

export type OSCQueryRNBOInstancesControlState = OSCQueryBaseNode & {
	CONTENTS: {
		sets: OSCQueryBaseNode & {
			CONTENTS: {
				initial: OSCQueryStringValue;
				meta: OSCQueryRNBOInstancesMetaState;
				save: OSCQuerySingleValue<OSCQueryValueType.String, string>;
				load: OSCQuerySingleValue<OSCQueryValueType.String, string> & {
					RANGE: Array<{ VALS: string[]; }>;
				};
				presets?: OSCQueryBaseNode & {
					CONTENTS: {
						save: OSCQuerySingleValue<OSCQueryValueType.String, string>;
						load: OSCQuerySingleValue<OSCQueryValueType.String, string> & {
							RANGE: Array<{ VALS: string[]; }>;
						};
						loaded?: OSCQueryStringValue;
					}
				};
				current?: OSCQueryBaseNode & {
					CONTENTS: {
						name: OSCQueryStringValue;
						dirty: OSCQueryBooleanValue;
					}
				};
				views?: OSCQueryRNBOSetViewState;
			}
		};
	};
}

export type OSCQueryRNBOInstancesState = OSCQueryBaseNode & {
	CONTENTS: Record<number, OSCQueryRNBOInstance> & {
		control: OSCQueryRNBOInstancesControlState;
		config: OSCQueryRNBOInstancesConfig;
	}
};

export type OSCQueryRNBOState = OSCQueryBaseNode & {
	CONTENTS: {
		config: OSCQueryRNBOConfigState;
		jack: OSCQueryRNBOJackState;
		patchers: OSCQueryRNBOPatchersState;
		inst: OSCQueryRNBOInstancesState;
		info: OSCQueryRNBOInfoState;
	};
};


export type OSCQueryState = OSCQueryBaseNode & {
	CONTENTS: {
		rnbo: OSCQueryRNBOState;
	};
};

export type OSCQuerySetNodeMeta = { position: { x: number; y: number; }; };

export type OSCQuerySetMeta = {
	nodes: Record<string, OSCQuerySetNodeMeta>;
};
