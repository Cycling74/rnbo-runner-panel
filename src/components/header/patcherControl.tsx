import React, { memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getPatchers, getLoadedPatcher } from "../../selectors/entities";
import { RootStateType } from "../../lib/store";
import styled from "styled-components";
import { loadPatcher } from "../../actions/device";

interface Patcher {
	id: string;
	name: string;
	loaded: boolean;
}

const PatcherSelection = styled.div`
	padding-bottom: 0.5rem;
`;

const PatcherControl = memo(function WrappedPatcherControl(): JSX.Element {
	const [patchers, loaded] = useAppSelector((state: RootStateType) => [getPatchers(state), getLoadedPatcher(state)]);

	const [patcherList, setPatcherList] = useState(null);
	const [selectedPatcher, setSelectedPatcher] = useState("");
	const dispatch = useAppDispatch();

	useEffect(() => {
		setPatcherList(patchers);
		setSelectedPatcher(loaded?.name);
	}, [loaded, patchers]);

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setSelectedPatcher(e.target.value);
		dispatch(loadPatcher(e.target.value));
	};

	return (
		<PatcherSelection>
			<select name="patchers" id="patchers" onChange={handleSelect} value={selectedPatcher}>
				<option disabled value="">
					Select a patcher:
				</option>
				{
					patcherList &&
						patcherList.valueSeq().map((p: Patcher) => <option key={p.id} value={p.name}>{p.name}</option>)
				}
			</select>
		</PatcherSelection>
	);
});

export default PatcherControl;
