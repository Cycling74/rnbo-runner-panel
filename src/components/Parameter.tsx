import React, { useRef } from "react";
import { ParameterRecord } from "../models/parameter"

export type ParameterProps = {
	record: ParameterRecord,
	onSetValue: (value: number) => void
};

export default function Parameter({ record, onSetValue } : ParameterProps) {

	const pref = useRef<HTMLDivElement>(null);

	const sendValueForEvent = (event: React.PointerEvent) => {
		const normX = (event.clientX - pref.current.offsetLeft) / pref.current.offsetWidth;
		const clipNormX = Math.max(0, Math.min(1, normX));
		onSetValue(clipNormX);
	};

	const handlePointerDown = (event: React.PointerEvent) => {
		pref.current.setPointerCapture(event.pointerId);
		sendValueForEvent(event);
	};

	const handlePointerUp = (event: React.PointerEvent) => {
		pref.current.releasePointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		if (pref.current.hasPointerCapture(event.pointerId))
			sendValueForEvent(event);
	};

	return (
		<div className="parameter"
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerMove={handlePointerMove}
			ref={pref}
		>
			<div className="parameterLabel">
				<label>{record.name}</label>
				<label>{record.value.toFixed(2)}</label>
			</div>
			<div className="slider">
				<div className="activeRange"
					style={ { width: `${~~(record.normalizedValue * 100)}%` } }
				>
				</div>
				<div
					className="sliderKnob"
					style={ { left: `${~~(record.normalizedValue * 100)}%` } }
				></div>
			</div>
		</div>

	)
}
