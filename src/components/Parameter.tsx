import React, { useRef } from "react";
import { ParameterRecord } from "../models/parameter"

export type ParameterProps = {
	record: ParameterRecord,
	onSetValue: (value: number) => void
};

export default function Parameter({ record, onSetValue } : ParameterProps) {

	const pref = useRef<HTMLDivElement>(null);

	const handlePointerDown = (event: React.PointerEvent) => {
		const normX = event.clientX / pref.current.offsetWidth;
		const clipNormX = Math.max(0, Math.min(1, normX));
		onSetValue(clipNormX);

		// TODO capture pointer?
	};

	const handlePointerUp = (event: React.PointerEvent) => {
		// TODO release pointer?
	};

	const handlePointerMove = (event: React.PointerEvent) => {
		const normX = event.clientX / pref.current.offsetWidth;
		const clipNormX = Math.max(0, Math.min(1, normX));
		onSetValue(clipNormX);
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
