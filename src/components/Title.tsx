import React from "react";
import { useRouter } from "next/router";

interface TitleProps {
	mobile: boolean;
}
export default function Title({mobile}: TitleProps) {
	const router = useRouter();
	const currentPath = router.pathname;

	let title = "";
	if(currentPath === "/parameters") {
		title = "PARAMETERS";
	} else if(currentPath === "/io") {
		title = mobile ? "IO" : "INPORTS AND OUTPORTS";
	} else if(currentPath === "/midi") {
		title = mobile ? "MIDI" : "MIDI CONTROL";
	}
	return (
		<p> {title} </p>
	);
}
