import { forwardRef, FunctionComponent, memo } from "react";
import { Button } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiRecord } from "@mdi/js";
import { Duration } from "dayjs/plugin/duration";

export type RecordStatusProps = {
	active: boolean;
	capturedTime: Duration;
	onToggleRecording: () => void;
};

const formatDuration = (d: Duration) => d.format(d.hours() > 0 ? "hh:mm:ss" : "mm:ss");

export const RecordStatus: FunctionComponent<RecordStatusProps> = memo(forwardRef<HTMLButtonElement, RecordStatusProps>(
	function WrappedRecordComponent({ active, capturedTime, onToggleRecording }, ref) {
		return (
			<Button
				color="gray"
				leftSection={ <IconElement path={ mdiRecord } color={ active ? "red" : undefined } /> }
				onClick={ onToggleRecording }
				size="xs"
				variant="light"
				ref={ ref }
			>
				{ active  && capturedTime ? formatDuration(capturedTime) : "--:--" }
			</Button>
		);
	}
));
