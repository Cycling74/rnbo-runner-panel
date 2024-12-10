import { FunctionComponent, memo } from "react";
import classes from "./cpu.module.css";

export type CPUStatusProps = {
	load: number;
};

export const CPUStatus: FunctionComponent<CPUStatusProps> = memo(function WrappedCPUStatusComponent({
	load
}) {
	return (
		<div className={ classes.cpuRoot } >
			<div className={ classes.cpuBar } style={{ width: `${load}%`}} />
			<label className={ classes.cpuLabel } >
				{ `${Math.round(load)}%` }
			</label>
		</div>
	);
});
