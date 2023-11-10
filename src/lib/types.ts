
// See https://github.com/Microsoft/TypeScript/issues/1897
export type AnyJson =
 | string
 | number
 | boolean
 | null
 | AnyJson[]
 | {[key: string]: AnyJson}

export interface JsonMap {  [key: string]: AnyJson }

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
} | {
	TYPE: T;
	VALUE: V[];
	ACCESS: OSCAccess;
	CLIPMODE: OSCClipMode;
	EXTENDED_TYPE: "list"
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
		compiler_id: OSCQueryStringValue;
		compiler_version: OSCQueryStringValue;
		disk_bytes_available: OSCQueryStringValue;
		supported_cmds: OSCQueryListValue;
		system_id: OSCQueryListValue;
		system_name: OSCQueryListValue;
		system_processor: OSCQueryListValue;
		unpported_cmds: OSCQueryListValue;
		update: OSCQueryBaseNode & {
			CONTENTS: {
				supported: OSCQueryBooleanValue;
			};
		}
		version: OSCQueryListValue;
	};
};

export type OSCQueryRNBOConfigState = OSCQueryBaseNode & {
	CONTENTS: {
		patcher_midi_program_change_channel: OSCQueryStringValue & OSCQueryStringValueRange;
		control_auto_connect_midi: OSCQueryBooleanValue;
	}
};

export type OSCQueryRNBOInstanceConfig = OSCQueryBaseNode & {
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
			CONTENTS: Record<string, OSCQueryListValue<string, string[]>>;
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

export type OSCQueryRNBOJackConfig =  OSCQueryBaseNode & {
	CONTENTS: {
		period_frames: OSCQueryIntValue & OSCQueryValueRange;
		sample_rate: OSCQueryFloatValue & OSCQueryValueRange;
		num_periods?: OSCQueryIntValue & OSCQueryValueRange;
		card?: OSCQueryStringValue & OSCQueryStringValueRange;
	};
};

export type OSCQueryRNBOJackState = OSCQueryBaseNode & {
	CONTENTS: {
		active: OSCQueryBooleanValue;
		connections: OSCQueryRNBOJackConnections,
		info: OSCQueryBaseNode & {
			CONTENTS: {
				is_realtime: OSCQueryBooleanValue;
				owns_server: OSCQueryBooleanValue;
				ports: OSCQueryRNBOJackPortInfo;
			};
		};
		config: OSCQueryRNBOJackConfig;
		control: any;
		transport: {
			bpm: OSCQueryFloatValue;
			rolling: OSCQueryBooleanValue;
			sync: OSCQueryBooleanValue;
		};
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
		normalized: OSCQueryFloatValue & OSCQueryValueRange & { VALUE: number; }
	};
	VALUE: number;
};

export type OSCQueryRNBOInstanceParameterInfo = OSCQueryRNBOInstanceParameterValue | {
	CONTENTS: Record<string, OSCQueryRNBOInstanceParameterInfo>;
	VALUE: undefined;
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
		name: OSCQueryStringValue & { VALUE: string; };
		params: OSCQueryBaseNode & {
			CONTENTS: Record<string, OSCQueryRNBOInstanceParameterInfo>;
		}
		data_refs: OSCQueryBaseNode & {
			CONTENTS: Record<string, OSCQueryStringValue>;
		};
		presets: OSCQueryBaseNode & {
			CONTENTS: {
				entries: OSCQueryRNBOInstancePresetEntries;
				del: OSCQueryStringValue;
				delete: OSCQueryStringValue;
				initial: OSCQueryStringValue;
				load: OSCQueryStringValue;
				save: OSCQueryStringValue;
			};
		};
		messages?: OSCQueryBaseNode & {
			CONTENTS: {
				in: OSCQueryBaseNode & {
					CONTENTS: Record<string, OSCQueryUnknownValue>;
				};
				out: OSCQueryBaseNode & {
					CONTENTS: Record<string, OSCQueryValue>;
				};
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

export type OSCQueryRNBOInstancesControlState = OSCQueryBaseNode & {
	CONTENTS: {
		sets: OSCQueryBaseNode & {
			CONTENTS: {
				meta: OSCQuerySingleValue<OSCQueryValueType.String, string>;
				save: OSCQuerySingleValue<OSCQueryValueType.String, string>;
				load: OSCQuerySingleValue<OSCQueryValueType.String, string> & {
					RANGE: Array<{ VALS: string[]; }>;
				}
			}
		};
	};
}

export type OSCQueryRNBOInstancesState = OSCQueryBaseNode & {
	CONTENTS: Record<number, OSCQueryRNBOInstance> & {
		control: OSCQueryRNBOInstancesControlState;
		config: OSCQueryRNBOInstanceConfig;
	}
};

export type OSCQueryRNBOState = OSCQueryBaseNode & {
	CONTENTS: {
		config: OSCQueryRNBOConfigState;
		jack: OSCQueryRNBOJackState;
		patchers: OSCQueryRNBOPatchersState;
		inst: OSCQueryRNBOInstancesState;
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
}
