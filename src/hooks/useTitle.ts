import { useRouter } from "next/router";

interface TitleProps {
	mobile: boolean;
}

export default function useTitle({ mobile }: TitleProps) {
	const router = useRouter();
	const currentPath = router.pathname;
	switch (currentPath) {
		case "/parameters":
			return "PARAMETERS";
		case "/io":
			return mobile ? "IO" : "INPORTS AND OUTPORTS";
		case "/midi":
			return mobile ? "MIDI" : "MIDI CONTROL";
		default:
			return "";
	}
}
