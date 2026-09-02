import { ActionIcon, Group, Modal, NumberInput, Select, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { ChangeEvent, FunctionComponent, KeyboardEvent, MouseEvent, PointerEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getShowTransportControl, getTransportControlState } from "../../selectors/transport";
import { decrementTransportBPMOnRemote, hideTransportControl, incrementTransportBPMOnRemote, setTransportBPMOnRemote, setTransportTimeSignatureOnRemote, toggleTransportLinkSyncOnRemote, toggleTransportRollingOnRemote, toggleTransportSyncOnRemote, resetTransportPositionOnRemote } from "../../actions/transport";
import classes from "./page.module.css";
import { clamp } from "../../lib/util";
import { BPMRange, TimeSignatureDenominators, TimeSignatureRange } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { mdiChevronDown, mdiChevronUp, mdiPlay, mdiRewind } from "@mdi/js";

type ActivePointer = {
	id: number;
	startY: number;
	startValue: number;
};

const formatBPMValue = (value: number): number => {
	return Number.isInteger(value)	? value : Math.round(value * 10) / 10;
};

const timeSignatureDenominatorOptions = TimeSignatureDenominators.map(d => String(d));

const TransportControl: FunctionComponent = memo(function WrappedTransport() {

	const dispatch = useAppDispatch();
	const onClose = useCallback(() => dispatch(hideTransportControl()), [dispatch]);
	const showFullScreen = useIsMobileDevice();
	const [activePointer, setActivePointer] = useState<ActivePointer | undefined>(undefined);
	const inputRef = useRef<HTMLInputElement>();
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
	const onLinkSyncToggle = useCallback((e: ChangeEvent<HTMLInputElement>) => dispatch(toggleTransportLinkSyncOnRemote()), [dispatch]);
	const onTransportReposition = useCallback((e: MouseEvent<HTMLButtonElement>) => dispatch(resetTransportPositionOnRemote()), [dispatch]);

	const onIncrementTempo = useCallback(() => dispatch(incrementTransportBPMOnRemote()), [dispatch]);
	const onDecrementTempo = useCallback(() => dispatch(decrementTransportBPMOnRemote()), [dispatch]);

	const onTimeSigNumeratorChange = useCallback((value: number | string) => {
		if (typeof value !== "number" || Number.isNaN(value)) return;
		const beatsPerBar = clamp(Math.round(value), TimeSignatureRange.Min, TimeSignatureRange.Max);
		dispatch(setTransportTimeSignatureOnRemote(beatsPerBar, controlState.time_signature[1]));
	}, [dispatch, controlState.time_signature]);

	const onTimeSigDenominatorChange = useCallback((value: string | null) => {
		const beatType = parseInt(value || "", 10);
		if (!TimeSignatureDenominators.includes(beatType)) return;
		dispatch(setTransportTimeSignatureOnRemote(controlState.time_signature[0], beatType));
	}, [dispatch, controlState.time_signature]);

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
		<Modal.Root opened={ doShow } onClose={ onClose } fullScreen={ showFullScreen } >
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Transport Control</Modal.Title>
					<Group gap="sm" wrap="nowrap">
						<Text fz="sm" fw={ 500 } className={ classes.transportPosition } >
							<span className={ classes.transportPositionBar } >{ controlState.bar_beat[0] }</span>{ ":" }<span className={ classes.transportPositionBeat } >{ controlState.bar_beat[1] }</span>
						</Text>
						<Modal.CloseButton />
					</Group>
				</Modal.Header>
				<Modal.Body>
					<Stack gap="md">
						<Group gap="xs" align="center" wrap="nowrap" justify="space-between">
							<Group gap="xs" align="center" wrap="nowrap">
								<Tooltip label={ controlState.rolling ? "Click to stop the transport" : "Click to resume the transport" } >
									<ActionIcon onClick={ onRollToggle } size="lg" variant={ controlState.rolling ? "light" : "default" } >
										<IconElement path={ mdiPlay } />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={ "Click to reset the transport to the start" } >
									<ActionIcon onClick={ onTransportReposition } size="lg" >
										<IconElement path={ mdiRewind } />
									</ActionIcon>
								</Tooltip>
							</Group>
							<Group gap="xs" align="center" wrap="nowrap">
								<Tooltip label="Toggle Jack transport sync to Ableton Link" refProp="rootRef">
									<Switch onChange={ onLinkSyncToggle } name="linksync" checked={ controlState.linksync } label="Link" labelPosition="left" size="md"/>
								</Tooltip>
								<Tooltip label="Toggle runner sync to Jack's transport" refProp="rootRef">
									<Switch onChange={ onSyncToggle } name="sync" checked={ controlState.sync } label="Sync" labelPosition="left" size="md"/>
								</Tooltip>
							</Group>
						</Group>
						<Group gap="md" align="center" wrap="nowrap">
							<NumberInput
								name="bpm"
								size="sm"
								readOnly
								leftSection={ <Text fz="xs">bpm</Text> }
								onKeyDown={ onTempoKeyDown }
								allowNegative={ false }
								flex={ 1 }
								miw={ 130 }
								value={ formatBPMValue(activePointer !== undefined ? displayValue : controlState.bpm) }
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
											<IconElement path={ mdiChevronUp } size="0.9em"/>
										</button>
										<button onClick={ onDecrementTempo }>
											<IconElement path={ mdiChevronDown } size="0.9em"/>
										</button>
									</div>
								}
							/>
							<Group gap={ 4 } align="center" wrap="nowrap">
								<Text fz="xs" c="dimmed" >sig</Text>
								<NumberInput
									name="time_sig_numerator"
									size="sm"
									min={ TimeSignatureRange.Min }
									max={ TimeSignatureRange.Max }
									allowNegative={ false }
									allowDecimal={ false }
									hideControls
									w={ 56 }
									aria-label="Time signature beats per bar"
									value={ controlState.time_signature[0] }
									onChange={ onTimeSigNumeratorChange }
								/>
								<Text fz="sm">/</Text>
								<Select
									name="time_sig_denominator"
									size="sm"
									w={ 68 }
									aria-label="Time signature beat type"
									allowDeselect={ false }
									data={ timeSignatureDenominatorOptions }
									value={ String(controlState.time_signature[1]) }
									onChange={ onTimeSigDenominatorChange }
								/>
							</Group>
						</Group>
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});

export default TransportControl;
