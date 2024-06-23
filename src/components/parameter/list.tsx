import { FunctionComponent, memo, useEffect, useRef, useState } from "react";
import ParameterItem, { parameterBoxHeight } from "./item";
import classes from "./parameters.module.css";
import { useViewportSize } from "@mantine/hooks";
import { Breakpoints } from "../../lib/constants";
import { clamp } from "../../lib/util";
import { ParameterRecord } from "../../models/parameter";
import { OrderedSet } from "immutable";
import { useThemeColorScheme } from "../../hooks/useTheme";

export type ParameterListProps = {
	isMIDIMapping: boolean;
	onActivateMIDIMapping: (parameter: ParameterRecord) => any;
	onSetNormalizedValue: (parameter: ParameterRecord, nValue: number) => any;
	onSaveMetadata: (parameter: ParameterRecord, meta: string) => any;
	onRestoreMetadata: (parameter: ParameterRecord) => any;
	onClearMidiMapping: (parameter: ParameterRecord) => any;
	parameters: OrderedSet<ParameterRecord>;
}

const ParameterList: FunctionComponent<ParameterListProps> = memo(function WrappedParameterList({
	isMIDIMapping,
	onActivateMIDIMapping,
	onSetNormalizedValue,
	onSaveMetadata,
	onRestoreMetadata,
	onClearMidiMapping,
	parameters
}) {

	const ref = useRef<HTMLDivElement>();
	const [topCoord, setTopCoord] = useState<number>(0);
	const { height, width } = useViewportSize();
	const colorScheme  = useThemeColorScheme();

	const paramOverflow = Math.ceil((parameters.size * parameterBoxHeight) / (height - topCoord));

	let columnCount = 1;
	if (width >= Breakpoints.xl) {
		columnCount = clamp(paramOverflow, 1, 4);
	} else if (width >= Breakpoints.lg) {
		columnCount = clamp(paramOverflow, 1, 3);
	} else if (width >= Breakpoints.sm) { // treat SM and MD equal
		columnCount = clamp(paramOverflow, 1, 2);
	}

	useEffect(() => {
		setTopCoord(ref.current?.getBoundingClientRect().top);
	}, [ref, height]);

	return (
		<div ref={ ref } className={ classes.parameterList } data-color-scheme={ colorScheme } data-active-midi-mapping={ isMIDIMapping } style={{ columnCount }} >
			{
				ref.current === null ? null : parameters.map(p =>
					<ParameterItem
						key={p.id}
						param={p}
						instanceIsMIDIMapping={ isMIDIMapping }
						onActivateMIDIMapping={ onActivateMIDIMapping }
						onSetNormalizedValue={ onSetNormalizedValue }
						onSaveMetadata={ onSaveMetadata }
						onRestoreMetadata={ onRestoreMetadata }
						onClearMidiMapping={ onClearMidiMapping }
					/>
				)
			}
		</div>
	);
});

export default ParameterList;
