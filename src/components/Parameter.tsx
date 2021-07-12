import React, { useRef, memo, useState } from "react";
import { ParameterRecord } from "../models/parameter"

type ParameterProps = {
	record: ParameterRecord,
	onSetValue: (name:string, value: number) => void
};

 const Parameter = memo(function WrappedParameter({ record, onSetValue } : ParameterProps) {

	const pref = useRef<HTMLDivElement>(null);
	const [localValue, setLocalValue] = useState(0);
	const [useLocalValue, setUseLocalValue] = useState(false);

	const sendValueForEvent = (event: React.PointerEvent) => {
		const width = pref.current.offsetWidth;
		const marginLeft = width * 0.05;
		const normX = (event.clientX - pref.current.offsetLeft - marginLeft) / (pref.current.offsetWidth * 0.9);
		const clipNormX = Math.max(0, Math.min(1, normX));
		setLocalValue(clipNormX);
		onSetValue(record.name, clipNormX);
	};

	const handlePointerDown = (event: React.PointerEvent) => {
		pref.current.setPointerCapture(event.pointerId);
		setUseLocalValue(true);
		sendValueForEvent(event);
	};

	const handlePointerUp = (event: React.PointerEvent) => {
		setUseLocalValue(false);
		pref.current.releasePointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		if (pref.current.hasPointerCapture(event.pointerId)) {
			sendValueForEvent(event);
			event.preventDefault();
		}
	};

	const drawnValue = useLocalValue ? localValue : record.normalizedValue;
	const paramLabel = typeof record.value === "number" ? record.value.toFixed(2) : record.value;
	return (
		<div className="parameter"
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			ref={pref}
		>
			<div className="parameterLabel">
				<label>{record.name}</label>
				<label>{paramLabel}</label>
			</div>
			<div className="slider">
				<div className="activeRange"
					style={ { width: `${~~(drawnValue * 100)}%` } }
				>
				</div>
				<div
					className="sliderKnob"
					style={ { left: `${~~(drawnValue * 100)}%` } }
				></div>
			</div>
		</div>

	)
});

export default Parameter;
