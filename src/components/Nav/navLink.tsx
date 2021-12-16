import React, { FunctionComponent }  from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";

interface NavLinkProps {
	href: string;
	label: string;
}
interface NavLinkElementProps {
	active: boolean;
}

const NavLinkEl = styled.a<NavLinkElementProps>`
	padding: 0.5rem 0.1rem;
	font-weight: bold;
	color: ${({ active, theme }) => active ? theme.colors.secondary : theme.colors.lightText};
	&:hover {
		color: ${props => props.theme.colors.hilight};
		text-decoration: underline;
}`;

export const NavLink: FunctionComponent<NavLinkProps> = ({ href, label }) => {
	const router = useRouter();
	return (
		<Link href={href} passHref>
			<NavLinkEl active={router.pathname === href} >
				{label}
			</NavLinkEl>
		</Link>
	);
};
