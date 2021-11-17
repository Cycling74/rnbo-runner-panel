import React from "react";
import { useRouter } from "next/router";

interface TitleProps {
	mobile: boolean;
}
export default function Title({mobile}: TitleProps) {
	const router = useRouter();
	const currentPath = router.pathname;
	let title = "";
	switch (currentPath) {
		case "/parameters":
			title = "PARAMETERS";
			break;
		case "/io":
			title = mobile ? "IO" : "INPORTS AND OUTPORTS";
			break;
		case "/midi":
			title = mobile ? "MIDI" : "MIDI CONTROL";
			break;
		default:
			title = "";
	}
	return (
		<h1> {title} </h1>
	);
}
