import { forwardRef, FunctionComponent, memo } from "react";
import classes from "./cpu.module.css";

export type CPUStatusProps = {
	load: number;
};

export const CPUStatus: FunctionComponent<CPUStatusProps> = memo(forwardRef<HTMLDivElement, CPUStatusProps>(
	function WrappedCPUStatusComponent({ load }, ref) {
		return (
			<div className={ classes.cpuRoot } ref={ ref } >
				<div className={ classes.cpuBar } style={{ width: `${load}%`}} />
				<label className={ classes.cpuLabel } >
					{ `${Math.round(load)}%` }
				</label>
			</div>
		);
	}
));
