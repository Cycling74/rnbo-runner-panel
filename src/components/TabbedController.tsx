import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

export interface RevealProps {
	titles: string[];
	children: React.ReactNode[];
}

interface StyledProps {
	open: boolean;
}

const OpenButton = styled.button`
	padding: 0.6rem;
	border-radius: 8px;
	border-style: none;

	background-color: ${({ theme }) => theme.colors.primary};
	color: ${({ theme }) => theme.colors.lightNeutral};
	text-align: center;
	cursor: pointer;

	svg {
		margin-left: 0.5rem;
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.secondary};
	}
`;

const RevealWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: relative;
	padding-right: 1rem;
	color: ${({ theme }) => theme.colors.lightNeutral};

	@media (max-width: 769px) {
		padding-right: 0;
	}
`;

const RevealSubcontainer = styled.div<StyledProps>`
	position: absolute;
	top: 100%;
	display: ${({ open }) => open ? "flex" : "none"};
	flex-direction: column;
	background-color: ${({ theme }) => theme.colors.primary};
	border-radius: 8px;
	border-style: none;
	padding: 1rem;
	z-index: 8;
`;

export const TabbedController: React.FC<RevealProps> = ({ titles, children }) => {
	const [shownIndex, setShownIndex] = useState(-1);

	const toggleShownIndex = (i: number): void => {
		if (i === shownIndex) {
			setShownIndex(-1);
		} else {
			setShownIndex(i);
		}
	};

	const elements = children.map((child, index) => {
		return (
			<RevealWrapper key={index}>
				<OpenButton onClick={() => toggleShownIndex(index) }>
					{ titles[index] }
					{(shownIndex === index) ? <FontAwesomeIcon icon="angle-up" /> : <FontAwesomeIcon icon="angle-down" />}
				</OpenButton>
				<RevealSubcontainer open={(shownIndex === index)}>
					{ child }
				</RevealSubcontainer>
			</RevealWrapper>
		);
	});

	return (
		<>
			{ elements }
		</>
	);
};
