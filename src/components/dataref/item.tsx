import { FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { DataRefRecord } from "../../models/dataref";
import classes from "./datarefs.module.css";
import { ActionIcon, Autocomplete, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPen, faEraser } from "@fortawesome/free-solid-svg-icons";

interface DataRefEntryProps {
	dataref: DataRefRecord;
	options: string[];
	onClear: (dataref: DataRefRecord) => any;
	onUpdate: (dataref: DataRefRecord, fileName: string) => any;
}

const DataRefEntry: FunctionComponent<DataRefEntryProps> = memo(function WrappedDataRefEntry({
	dataref,
	options,
	onClear,
	onUpdate
}: DataRefEntryProps) {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>(dataref.fileName);
	const inputRef = useRef<HTMLInputElement>();

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setFileName(dataref.fileName);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, dataref, setFileName]);

	const onUpdateFileName = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onUpdate(dataref, fileName);
	}, [fileName, dataref, onUpdate]);

	const onClearDataRef = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onClear(dataref);
	}, [onClear, dataref]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			return void toggleEditing();
		}
	}, [toggleEditing]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing, inputRef]);

	useEffect(() => {
		setFileName(dataref.fileName);
		setIsEditing(false);
	}, [dataref, setFileName, setIsEditing]);

	return isEditing ? (
		<form onSubmit={ onUpdateFileName } >
			<Group align="flex-start">
				<label htmlFor={ dataref.id } className={ classes.datarefItemLabel } >{ dataref.id }</label>
				<Autocomplete
					className={ classes.datarefItemFileName }
					data={options}
					onChange={ setFileName }
					onKeyDown={ onKeyDown }
					ref={ inputRef }
					size="sm"
					value={ fileName }
					variant="default"
				/>
				<ActionIcon.Group>
					<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
						<FontAwesomeIcon icon={ faClose } />
					</ActionIcon>
					<ActionIcon variant="subtle" size="md" type="submit">
						<FontAwesomeIcon icon={ faCheck } />
					</ActionIcon>
				</ActionIcon.Group>
			</Group>
		</form>
	) : (
		<Group>
			<label htmlFor={ dataref.id } className={ classes.datarefItemLabel } >{ dataref.id }</label>
			<TextInput className={ classes.datarefItemFileName } readOnly variant="unstyled" value={ fileName } size="sm" />
			<ActionIcon.Group>
				<ActionIcon variant="subtle" color="red" size="md" onClick={ onClearDataRef } >
					<FontAwesomeIcon icon={ faEraser } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
					<FontAwesomeIcon icon={ faPen } />
				</ActionIcon>
			</ActionIcon.Group>
		</Group>
	);
});

export default DataRefEntry;
