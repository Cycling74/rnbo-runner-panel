import { Stack } from "@mantine/core";
import KeyRoll from "../components/keyroll";
import { PageTitle } from "../components/page/title";

export default function MIDI() {
	return (
		<Stack gap="sm">
			<PageTitle>MIDI</PageTitle>
			<KeyRoll />
		</Stack>
	);
}
