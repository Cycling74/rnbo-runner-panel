import { forwardRef, FunctionComponent, memo } from "react";
import { Button } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiRecord } from "@mdi/js";
import { Duration } from "dayjs/plugin/duration";

export type RecordStatusProps = {
	active: boolean;
	capturedTime: Duration;
	disabled: boolean;
	timeout: Duration | null;
	onToggleRecording: () => void;
};

const formatDuration = (current: Duration, timeout: Duration): string => {
	if (!timeout) {
		return current.format(current.hours() > 0 ? "hh:mm:ss" : "mm:ss");
	}

	const d = timeout.subtract(current);
	return `- ${d.format(d.hours() > 0 ? "hh:mm:ss" : "mm:ss")}`;
};

export const RecordStatus: FunctionComponent<RecordStatusProps> = memo(forwardRef<HTMLButtonElement, RecordStatusProps>(
	function WrappedRecordComponent({ active, capturedTime, disabled, onToggleRecording, timeout }, ref) {

		return (
			<Button
				disabled={ disabled }
				color="gray"
				leftSection={ <IconElement path={ mdiRecord } color={ active ? "red" : undefined } /> }
				onClick={ onToggleRecording }
				size="xs"
				variant="light"
				ref={ ref }
			>
				{ active && capturedTime ? formatDuration(capturedTime, timeout) : "--:--" }
			</Button>
		);
	}
));
