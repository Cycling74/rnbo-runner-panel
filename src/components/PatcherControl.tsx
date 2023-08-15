import React, { memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getPatchers } from "../selectors/entities";
import { RootStateType } from "../lib/store";
import styled from "styled-components";
import { loadPatcher, unloadPatcher } from "../actions/device";

interface StyledProps {
	open: boolean;
}

interface Patcher {
	id: string;
	name: string;
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

const PatcherPanel = styled.div<StyledProps>`
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
	const patchers = useAppSelector((state: RootStateType) => getPatchers(state));
	const [patcherList, setPatcherList] = useState(null);
	const [selectedPatcher, setSelectedPatcher] = useState("");
	const dispatch = useAppDispatch();

	useEffect(() => {
		setPatcherList(patchers);
	}, [patchers]);

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setSelectedPatcher(e.target.value);
		dispatch(loadPatcher(selectedPatcher))
	};

	return (
		<PatcherWrapper>
			<PatcherPanel>
				<PatcherSelection>
					<select name="patchers" id="patchers" defaultValue="" onChange={handleSelect}>
						<option disabled value="">
							Select a patcher:
						</option>
						{
							patcherList &&
								patcherList.valueSeq().map((p: Patcher) => <option key={p.id} value={p.name}>{p.name}</option>)
						}
					</select>
				</PatcherSelection>
			</PatcherPanel>
		</PatcherWrapper>
	);
});

export default PatcherControl;
