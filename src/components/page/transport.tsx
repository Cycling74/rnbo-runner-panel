import { ActionIcon, Group, Modal, NumberInput, Switch, Text } from "@mantine/core";
import { ChangeEvent, FunctionComponent, KeyboardEvent, MouseEvent, PointerEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getShowTransportControl, getTransportControlState } from "../../selectors/transport";
import { decrementTransportBPMOnRemote, hideTransportControl, incrementTransportBPMOnRemote, setTransportBPMOnRemote, toggleTransportRollingOnRemote, toggleTransportSyncOnRemote } from "../../actions/transport";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPlay } from "@fortawesome/free-solid-svg-icons";
import classes from "./page.module.css";
import { clamp } from "../../lib/util";
import { BPMRange } from "../../lib/constants";

type ActivePointer = {
	id: number;
	startY: number;
	startValue: number;
};

const TransportControl: FunctionComponent = memo(function WrappedTransport() {

	const dispatch = useAppDispatch();
	const onClose = useCallback(() => dispatch(hideTransportControl()), [dispatch]);
	const [activePointer, setActivePointer] = useState<ActivePointer | undefined>(undefined);
	const inputRef = useRef<HTMLDivElement>();
	const [displayValue, setDisplayValue] = useState<number>(0);

	const [
		doShow,
		controlState
	] = useAppSelector((state: RootStateType) => [
		getShowTransportControl(state),
		getTransportControlState(state)
	]);

	const onRollToggle = useCallback((e: MouseEvent<HTMLButtonElement>) => dispatch(toggleTransportRollingOnRemote()), [dispatch]);
	const onSyncToggle = useCallback((e: ChangeEvent<HTMLInputElement>) => dispatch(toggleTransportSyncOnRemote()), [dispatch]);

	const onIncrementTempo = useCallback(() => dispatch(incrementTransportBPMOnRemote()), [dispatch]);
	const onDecrementTempo = useCallback(() => dispatch(decrementTransportBPMOnRemote()), [dispatch]);

	const onTempoKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			dispatch(decrementTransportBPMOnRemote(e.shiftKey ? 10 : 1));
		} else if (e.key === "ArrowUp") {
			dispatch(incrementTransportBPMOnRemote(e.shiftKey ? 10 : 1));
		}
	}, [dispatch]);

	const onPointerDown = useCallback((e: PointerEvent<HTMLInputElement>) => {
		if (activePointer !== undefined || !inputRef.current) {
			return;
		}
		e.preventDefault();
		e.currentTarget.focus();
		setActivePointer({ id: e.pointerId, startY: e.clientY, startValue: controlState.bpm });
		setDisplayValue(controlState.bpm);
		inputRef.current.setPointerCapture(e.pointerId);
	}, [activePointer, inputRef, setDisplayValue, controlState.bpm]);

	const onPointerMove = useCallback((e: PointerEvent<HTMLInputElement>) => {
		if (activePointer?.id !== e.pointerId) {
			return;
		}
		e.preventDefault();
		const delta = activePointer.startY - e.clientY;
		const bpm = clamp(activePointer.startValue + Math.floor(delta * 0.15), BPMRange.Min, BPMRange.Max);
		setDisplayValue(bpm);
	}, [activePointer, setDisplayValue]);

	const onPointerUp = useCallback((e: PointerEvent<HTMLInputElement>) => {
		if (activePointer?.id !== e.pointerId) {
			return;
		}
		inputRef.current.releasePointerCapture(e.pointerId);
		setActivePointer(undefined);
		dispatch(setTransportBPMOnRemote(displayValue));
	}, [activePointer, dispatch, displayValue]);

	const onUpdateBPM = useCallback(() => {
		if (controlState.bpm !== displayValue) {
			dispatch(setTransportBPMOnRemote(displayValue));
		}
	}, [displayValue, controlState.bpm, dispatch]);

	useEffect(() => {
		const iv = activePointer ? setInterval(onUpdateBPM, 100) : null;
		return () => iv ? clearInterval(iv) : null;
	}, [activePointer, onUpdateBPM]);

	return (
		<Modal
			onClose={ onClose }
			opened={ doShow }
			withCloseButton={ false }
		>
			<Group gap="md" align="center">
				<ActionIcon onClick={ onRollToggle } size="lg" variant="transparent" color={ controlState.rolling ? undefined : "gray" } >
					<FontAwesomeIcon icon={ faPlay } />
				</ActionIcon>
				<NumberInput
					name="bpm"
					size="sm"
					readOnly
					leftSection={ <Text fz="xs">bpm</Text> }
					onKeyDown={ onTempoKeyDown }
					allowNegative={ false }
					flex={ 1 }
					value={ activePointer !== undefined ? displayValue : controlState.bpm }
					hideControls
					pointer={ false }
					onPointerDown={ onPointerDown }
					onPointerMove={ onPointerMove }
					onPointerUp={ onPointerUp }
					onPointerCancel={ onPointerUp}
					ref={ inputRef }
					classNames={{
						input: classes.transportTempoInput
					}}
					rightSection={
						<div className={ classes.transportTempoControl } >
							<button onClick={ onIncrementTempo } >
								<FontAwesomeIcon size="xs" icon={ faChevronUp } />
							</button>
							<button onClick={ onDecrementTempo }>
								<FontAwesomeIcon size="xs" icon={ faChevronDown } />
							</button>
						</div>
					}
				/>
				<Switch onChange={ onSyncToggle } name="sync" checked={ controlState.sync } onLabel="Sync" offLabel="Off" size="md"/>
			</Group>
		</Modal>
	);
});

export default TransportControl;
