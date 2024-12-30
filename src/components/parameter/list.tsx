import { ComponentType, useEffect, useRef, useState } from "react";
import { parameterBoxHeight, ParameterItemProps } from "./item";
import classes from "./parameters.module.css";
import { useViewportSize } from "@mantine/hooks";
import { Breakpoints } from "../../lib/constants";
import { clamp, genericMemo } from "../../lib/util";
import { ParameterRecord } from "../../models/parameter";
import { OrderedSet } from "immutable";
import { useThemeColorScheme } from "../../hooks/useTheme";

export type ParameterListProps<ExtraProps = object> = {
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onSetNormalizedValue: (parameter: ParameterRecord, nValue: number) => any;
	parameters: OrderedSet<ParameterRecord>;
	extraParameterProps: ExtraProps;
	ParamComponentType: ComponentType<ExtraProps & ParameterItemProps>;
}

const ParameterList = genericMemo(function WrappedParameterList<ExtraProps>({
	onRestoreMetadata,
	onSaveMetadata,
	onSetNormalizedValue,
	parameters,
	extraParameterProps,
	ParamComponentType
}: ParameterListProps<ExtraProps>) {

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

	let index = -1;

	return (
		<div ref={ ref } className={ classes.parameterList } data-color-scheme={ colorScheme } style={{ columnCount }} >
			{
				ref.current === null ? null : parameters.map(p =>
					<ParamComponentType
						key={p.id}
						param={p}
						index={ ++index }
						onRestoreMetadata={ onRestoreMetadata }
						onSaveMetadata={ onSaveMetadata }
						onSetNormalizedValue={ onSetNormalizedValue }
						{ ...extraParameterProps }
					/>
				)
			}
		</div>
	);
});

export default ParameterList;
