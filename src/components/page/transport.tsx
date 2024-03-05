import { ActionIcon, Group, Modal, NumberInput, Switch, Text } from "@mantine/core";
import { ChangeEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getShowTransportControl, getTransportControlState } from "../../selectors/transport";
import { decrementTransportBPMOnRemote, hideTransportControl, incrementTransportBPMOnRemote, toggleTransportRollingOnRemote, toggleTransportSyncOnRemote } from "../../actions/transport";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPlay } from "@fortawesome/free-solid-svg-icons";
import classes from "./page.module.css";

const TransportControl: FunctionComponent = memo(function WrappedTransport() {

	const dispatch = useAppDispatch();
	const onClose = useCallback(() => dispatch(hideTransportControl()), [dispatch]);

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
			dispatch(decrementTransportBPMOnRemote());
		} else if (e.key === "ArrowUp") {
			dispatch(incrementTransportBPMOnRemote());
		}
	}, [dispatch]);

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
					value={ controlState.bpm }
					hideControls
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
