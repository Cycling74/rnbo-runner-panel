import React, { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getPatchers, getLoadedPatcher } from "../../selectors/entities";
import { RootStateType } from "../../lib/store";
import { loadPatcher } from "../../actions/device";
import { Button, NativeSelect, Popover } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { PatcherRecord, UNLOAD_PATCHER_NAME } from "../../models/patcher";
import { useDisclosure } from "@mantine/hooks";

const PatcherControl = memo(function WrappedPatcherControl(): JSX.Element {

	const [opened, { close, toggle }] = useDisclosure();
	const [patchers, loaded] = useAppSelector((state: RootStateType) => [getPatchers(state), getLoadedPatcher(state)]);
	const dispatch = useAppDispatch();
	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		const patcher = patchers.get(e.target.value);
		if (!patcher) return;
		dispatch(loadPatcher(patcher));
		close();
	};

	return (
		<Popover onClose={ close } opened={ opened } width={ 300 } trapFocus position="bottom-end" withArrow arrowPosition="side" shadow="sm">
			<Popover.Target>
				<Button
					leftSection={ <FontAwesomeIcon icon={ faObjectGroup } /> }
					onClick={ toggle }
					variant={ opened ? "light" : "default" }
					size="xs"
				>
					Patcher
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<NativeSelect
					name="active_patcher"
					id="active_patcher"
					label="Active Patcher"
					description="Select the patcher to load"
					onChange={ handleSelect }
					value={ loaded?.name || "<none>" }
					data-autofocus
					data={
						patchers?.size
							? patchers?.valueSeq().map((p: PatcherRecord) => ({ label: p.name, value: p.id })).toArray()
							: [ { value: UNLOAD_PATCHER_NAME, label: "None" }]
					}
				/>
			</Popover.Dropdown>
		</Popover>
	);
});

export default PatcherControl;
