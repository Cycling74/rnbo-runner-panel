import { Stack } from "@mantine/core";
import InportList from "../components/port/inportList";
import { PageTitle } from "../components/page/title";

export default function IO() {
	return (
		<Stack gap="sm">
			<PageTitle>Inports & Outports</PageTitle>
			<InportList />
		</Stack>
	);
}
