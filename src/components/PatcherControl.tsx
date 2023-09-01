import React, { memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getPatchers, getLoadedPatcher } from "../selectors/entities";
import { RootStateType } from "../lib/store";
import styled from "styled-components";
import { loadPatcher } from "../actions/device";

interface Patcher {
	id: string;
	name: string;
	loaded: boolean;
}

const PatcherWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: relative;
	padding-right: 2rem;
	color: ${({ theme }) => theme.colors.lightNeutral};

	@media (max-width: 769px) {
		padding-right: 0;
	}
`;

const PatcherPanel = styled.div`
	display: "flex";
	flex-direction: column;
	background-color: ${({ theme }) => theme.colors.primary};
	border-radius: 8px;
	border-style: none;
	padding: 1rem;
	z-index: 8;
`;

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
