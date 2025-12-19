import { ActionIcon, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ChangeEvent, FC, KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { IconElement } from "../elements/icon";
import { mdiClose, mdiMagnify } from "@mdi/js";

export type SearchInputProps = {
	onSearch: (query: string) => any;
};

export const SearchInput: FC<SearchInputProps> = memo(function WrappedSearchInput({
	onSearch
}) {

	const [showSearchInput, showSearchInputActions] = useDisclosure();
	const [searchValue, setSearchValue] = useState<string>("");
	const searchInputRef = useRef<HTMLInputElement>();

	const onChangeSearchValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	}, [setSearchValue]);

	const onBlur = useCallback(() => {
		if (!searchValue?.length) showSearchInputActions.close();
	}, [searchValue, showSearchInputActions]);

	const onClear = useCallback(() => {
		setSearchValue("");
		searchInputRef.current?.focus();
	}, [setSearchValue]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			if (searchValue.length) {
				setSearchValue("");
			} else {
				searchInputRef.current?.blur();
			}
		}
	}, [setSearchValue, searchInputRef, searchValue]);

	useEffect(() => {
		onSearch(searchValue);
	}, [searchValue, onSearch]);

	return (
		showSearchInput || searchValue?.length ? (
			<TextInput
				autoFocus
				ref={ searchInputRef }
				onKeyDown={ onKeyDown }
				onBlur={ onBlur }
				onChange={ onChangeSearchValue }
				leftSection={ <IconElement path={ mdiMagnify } /> } size="xs"
				rightSection={(
					<ActionIcon variant="transparent" color="gray" onClick={ onClear } >
						<IconElement path={ mdiClose } size="1em" />
					</ActionIcon>
				)}
				value={ searchValue }
			/>
		) : (
			<ActionIcon size="md" variant="default" onClick={ showSearchInputActions.open } >
				<IconElement path={ mdiMagnify } />
			</ActionIcon>
		)
	);
});
